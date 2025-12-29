-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('NORMAL', 'DEBATABLE', 'CLAIM');

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "postType" "PostType" NOT NULL DEFAULT 'NORMAL';
