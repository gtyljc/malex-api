
-- args

-- @param {String} $1:opening_at when enterprise is openning
-- @param {String} $2:closing_at when enterprise is closing
-- @param {Float} $3:min_duration minimal duration of one appointment
-- @param {String} $4:support_email support email of enterprise
-- @param {String} $5:phone_number telephone number of enterprise
-- @param {String} $6:timezone default timezone of DB ( the same where enterprise is )

-- /args

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