-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "opening_at" TIMESTAMP(3) NOT NULL,
    "closing_at" TIMESTAMP(3) NOT NULL,
    "min_duration" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);
