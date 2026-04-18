/*
  Warnings:

  - The `verification` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BankName" AS ENUM ('KBANK', 'SCB', 'BBL', 'KTB', 'BAY', 'TTB', 'OTHER');

-- DropIndex
DROP INDEX "ReadingHistory_userId_novelId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "realSurname" TEXT,
ADD COLUMN     "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "withdrawalOTP" TEXT,
ADD COLUMN     "withdrawalOTPExpiry" TIMESTAMP(3),
DROP COLUMN "verification",
ADD COLUMN     "verification" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
