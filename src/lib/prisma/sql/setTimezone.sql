
-- sets session timezone to specified into siteConfig
DO $$
DECLARE
    tz text;
BEGIN
    SELECT timezone INTO tz FROM "SiteConfig" LIMIT 1;

    EXECUTE format('SET TIME ZONE %L', tz);
END $$;
