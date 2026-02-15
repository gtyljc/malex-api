-- CreateTable
CREATE TABLE "Admins" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_logged" BOOLEAN NOT NULL,
    "fullname" TEXT NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);
