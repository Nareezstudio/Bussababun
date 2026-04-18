/*
  Warnings:

  - The primary key for the `ReadingHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `readAt` on the `ReadingHistory` table. All the data in the column will be lost.
  - The `id` column on the `ReadingHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,novelId]` on the table `ReadingHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `novelId` to the `ReadingHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReadingHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_novelId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_chapterId_fkey";

-- DropIndex
DROP INDEX "ReadingHistory_userId_chapterId_key";

-- AlterTable
ALTER TABLE "ReadingHistory" DROP CONSTRAINT "ReadingHistory_pkey",
DROP COLUMN "readAt",
ADD COLUMN     "novelId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ReadingHistory_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingHistory_userId_novelId_key" ON "ReadingHistory"("userId", "novelId");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingHistory" ADD CONSTRAINT "ReadingHistory_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
