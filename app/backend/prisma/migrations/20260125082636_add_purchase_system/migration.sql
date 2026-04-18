/*
  Warnings:

  - The values [ARCHIVED] on the enum `NovelStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `updatedAt` on the `Chapter` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Library` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_NovelToCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NovelStatus_new" AS ENUM ('ONGOING', 'COMPLETED', 'ONHOLD');
ALTER TABLE "public"."Novel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Novel" ALTER COLUMN "status" TYPE "NovelStatus_new" USING ("status"::text::"NovelStatus_new");
ALTER TYPE "NovelStatus" RENAME TO "NovelStatus_old";
ALTER TYPE "NovelStatus_new" RENAME TO "NovelStatus";
DROP TYPE "public"."NovelStatus_old";
ALTER TABLE "Novel" ALTER COLUMN "status" SET DEFAULT 'ONGOING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_novelId_fkey";

-- DropForeignKey
ALTER TABLE "Library" DROP CONSTRAINT "Library_novelId_fkey";

-- DropForeignKey
ALTER TABLE "Library" DROP CONSTRAINT "Library_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "_NovelToCategory" DROP CONSTRAINT "_NovelToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_NovelToCategory" DROP CONSTRAINT "_NovelToCategory_B_fkey";

-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Novel" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'READER';

-- DropTable
DROP TABLE "Library";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "_NovelToCategory";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToNovel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToNovel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_userId_chapterId_key" ON "Purchase"("userId", "chapterId");

-- CreateIndex
CREATE INDEX "_CategoryToNovel_B_index" ON "_CategoryToNovel"("B");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToNovel" ADD CONSTRAINT "_CategoryToNovel_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToNovel" ADD CONSTRAINT "_CategoryToNovel_B_fkey" FOREIGN KEY ("B") REFERENCES "Novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
