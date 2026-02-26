 
import "dotenv/config";
import { PrismaClient } from "./generated/client";
import { setSiteConfig, setTimezone } from "./generated/sql";
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from "@lib/utils";

const adapter = new PrismaPg({ connectionString: env("DATABASE_URL") });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
    
    // set deafult config
    await prisma.$queryRawTyped(
        setSiteConfig(
            env("SITE_CONFIG_OPENING_AT"),
            env("SITE_CONFIG_CLOSING_AT"),
            env("SITE_CONFIG_CLOSING_AT"),
            env("SITE_CONFIG_SUPPORT_EMAIL"),
            env("SITE_CONFIG_PHONE_NUMBER"),
            env("SITE_CONFIG_TIMEZONE"),
            env("SITE_CONFIG_COUNTRY")
        )
    )

    // set DB timezone
    await prisma.$queryRawTyped(setTimezone())
}

main()
    .then(
        async () => await prisma.$disconnect()
    ).catch(
        async (e) => {
            console.error(e);
            
            await prisma.$disconnect();

            process.exit(1);
        }
    );