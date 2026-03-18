package com.maru.api.config;

import io.minio.*;
import io.minio.errors.ErrorResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

@Component
public class MinioInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MinioInitializer.class);

    private final MinioClient minioClient;
    private final String bucket;

    public MinioInitializer(MinioClient minioClient,
                            @Value("${minio.bucket}") String bucket) {
        this.minioClient = minioClient;
        this.bucket = bucket;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        ensureBucket();
        setPublicReadPolicy();
        uploadDefaultAvatars();
    }

    private void ensureBucket() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            log.info("MinIO 버킷 생성: {}", bucket);
        }
    }

    private void setPublicReadPolicy() throws Exception {
        String policy = """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": {"AWS": ["*"]},
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/avatars/*"]
                    }
                  ]
                }
                """.formatted(bucket);

        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(bucket)
                        .config(policy)
                        .build());
    }

    private void uploadDefaultAvatars() throws Exception {
        var resolver = new PathMatchingResourcePatternResolver();
        Resource[] avatars = resolver.getResources("classpath:static/avatars/*.png");

        for (Resource avatar : avatars) {
            String objectName = "avatars/default/" + avatar.getFilename();

            if (objectExists(objectName)) {
                continue;
            }

            try (var inputStream = avatar.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(objectName)
                                .stream(inputStream, avatar.contentLength(), -1)
                                .contentType("image/png")
                                .build());
                log.info("기본 아바타 업로드: {}", objectName);
            }
        }
    }

    private boolean objectExists(String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build());
            return true;
        } catch (ErrorResponseException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
