/*
  Warnings:

  - You are about to drop the column `bankAccountNumber` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "bankAccountNumber",
ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "idCardNumber" TEXT,
ADD COLUMN     "realName" TEXT;
