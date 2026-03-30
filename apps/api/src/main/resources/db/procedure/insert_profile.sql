CREATE OR REPLACE FUNCTION insert_profile(
    p_user_id           UUID,
    p_type              VARCHAR,
    p_display_name      VARCHAR,
    p_profile_image_url VARCHAR
)
RETURNS profiles AS $$
DECLARE
    result profiles;
BEGIN
    INSERT INTO profiles (user_id, type, display_name, profile_image_url)
    VALUES (p_user_id, p_type, p_display_name, p_profile_image_url)
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
