-- CreateEnum
CREATE TYPE "BwtChoice" AS ENUM ('WHATSAPP', 'PHONE', 'TEXT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'USER', 'ADMIN', 'SUPERUSER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "CategoryChoice" AS ENUM ('PLUMBING', 'ASSEMBLING', 'MOUNTING');

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "surname" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "job_desc" VARCHAR(500) NOT NULL,
    "bwt" "BwtChoice" NOT NULL,
    "phone_number" VARCHAR(20),
    "duration" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(0) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "img_url" VARCHAR(2800) NOT NULL,
    "img_id" VARCHAR(50) NOT NULL,
    "category" "CategoryChoice" NOT NULL,
    "timestamp" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL DEFAULT '1',
    "opening_at" TIME(0) NOT NULL,
    "closing_at" TIME(0) NOT NULL,
    "min_duration" DOUBLE PRECISION NOT NULL,
    "support_email" VARCHAR(50) NOT NULL,
    "phone_number" VARCHAR(25) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL,
    "c_country" VARCHAR(2) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "fullname" VARCHAR(50) NOT NULL,
    "is_super" BOOLEAN NOT NULL DEFAULT false,
    "last_session" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(0) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL,
    "user_id" VARCHAR(16) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_date_key" ON "Appointment"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Work_img_url_key" ON "Work"("img_url");

-- CreateIndex
CREATE UNIQUE INDEX "Work_img_id_key" ON "Work"("img_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hash_key" ON "RefreshToken"("hash");
