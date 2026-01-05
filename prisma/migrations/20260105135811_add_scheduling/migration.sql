-- AlterTable
ALTER TABLE "ProtectedContent" ADD COLUMN     "nextScanAt" TIMESTAMP(3),
ADD COLUMN     "scanFrequency" TEXT NOT NULL DEFAULT 'MANUAL';
