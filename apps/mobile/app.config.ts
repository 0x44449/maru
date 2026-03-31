import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "마루",
  slug: "maru",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/maru-icon.png",
  scheme: "maru",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/maru-ios.icon",
    bundleIdentifier: "app.sandori.maru",
    infoPlist: {
      NSPhotoLibraryUsageDescription: "프로필 사진을 설정하기 위해 사진 라이브러리에 접근합니다.",
      NSCameraUsageDescription: "프로필 사진을 촬영하기 위해 카메라에 접근합니다.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/maru-icon-foreground.png",
      backgroundImage: "./assets/images/maru-icon-background.png",
      monochromeImage: "./assets/images/maru-icon-monochrome.png",
    },
    package: "app.sandori.maru",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-image-picker",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        android: {
          image: "./assets/images/maru-icon-foreground.png",
          imageWidth: 76,
        },
      },
    ],
    [
      "@react-native-seoul/kakao-login",
      {
        kakaoAppKey: process.env.EXPO_PUBLIC_KAKAO_APP_KEY,
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/",
          ],
        },
      },
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
