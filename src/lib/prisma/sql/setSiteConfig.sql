
-- writes new row if table is empty
INSERT INTO "SiteConfig" (
    id,
    opening_at,
    closing_at,
    min_duration,
    support_email,
    phone_number,
    timezone
) SELECT '1', $1, $2, $3, $4, $5, $6 WHERE NOT EXISTS (
    SELECT * FROM "SiteConfig"
);