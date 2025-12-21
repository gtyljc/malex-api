-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "is_logged" SET DEFAULT false;

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(16);
