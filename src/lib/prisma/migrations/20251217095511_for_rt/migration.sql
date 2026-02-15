/*
  Warnings:

  - You are about to drop the `Admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Admins";

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_logged" BOOLEAN NOT NULL,
    "fullname" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);
