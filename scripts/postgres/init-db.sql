DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'nutrillodb') THEN
        PERFORM format('CREATE DATABASE nutrillodb')::text;
    END IF;
END
$$;