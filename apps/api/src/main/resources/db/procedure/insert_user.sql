CREATE OR REPLACE FUNCTION insert_user(
    p_user_tag VARCHAR,
    p_email    VARCHAR,
    p_name     VARCHAR
)
RETURNS users AS $$
DECLARE
    result users;
BEGIN
    INSERT INTO users (user_tag, email, name)
    VALUES (p_user_tag, p_email, p_name)
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
