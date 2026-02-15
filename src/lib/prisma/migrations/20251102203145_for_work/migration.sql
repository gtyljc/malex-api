/*
  Warnings:

  - The `img_urls` column on the `work` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."work_img_urls_key";

-- AlterTable
ALTER TABLE "work" DROP COLUMN "img_urls",
ADD COLUMN     "img_urls" VARCHAR(2800)[];
