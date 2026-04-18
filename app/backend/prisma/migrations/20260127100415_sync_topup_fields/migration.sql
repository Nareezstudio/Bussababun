-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "amount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TopUpHistory" ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "method" DROP NOT NULL;
