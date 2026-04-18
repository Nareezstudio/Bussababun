/*
  Warnings:

  - You are about to alter the column `amount` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `amount` on table `Purchase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `TopUpHistory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `method` on table `TopUpHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Purchase" ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "TopUpHistory" ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "method" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankBookImage" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "idCardImage" TEXT,
ADD COLUMN     "verification" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "systemFee" DOUBLE PRECISION NOT NULL,
    "writerRevenue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
