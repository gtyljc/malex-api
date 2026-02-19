 
import "dotenv/config";
import { PrismaClient } from "./generated/client";
import { setSiteConfig, setTimezone } from "./generated/sql";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
    
    
    // set deafult config
    await prisma.$queryRawTyped(
        setSiteConfig(
            process.env.SITE_CONFIG_OPENING_AT!,
            process.env.SITE_CONFIG_CLOSING_AT!,
            parseFloat(process.env.SITE_CONFIG_MIN_DURATION!),
            process.env.SITE_CONFIG_SUPPORT_EMAIL!,
            process.env.SITE_CONFIG_PHONE_NUMBER!,
            process.env.SITE_CONFIG_TIMEZONE!,
            process.env.SITE_CONFIG_COUNTRY!
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