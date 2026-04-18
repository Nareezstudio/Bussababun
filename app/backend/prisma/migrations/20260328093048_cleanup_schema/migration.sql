/*
  Warnings:

  - You are about to drop the `Library` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Library" DROP CONSTRAINT "Library_novelId_fkey";

-- DropForeignKey
ALTER TABLE "Library" DROP CONSTRAINT "Library_userId_fkey";

-- DropIndex
DROP INDEX "ReadingHistory_userId_novelId_key";

-- DropTable
DROP TABLE "Library";
