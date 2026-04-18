/*
  Warnings:

  - A unique constraint covering the columns `[userId,chapterId]` on the table `ReadingHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReadingHistory_userId_chapterId_key" ON "ReadingHistory"("userId", "chapterId");
