/*
  Warnings:

  - You are about to drop the column `published` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `textChannnelId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `TextChannel` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_textChannnelId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "published",
DROP COLUMN "textChannnelId",
DROP COLUMN "title",
ADD COLUMN     "textChannelId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "TextChannel_name_key" ON "TextChannel"("name");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_textChannelId_fkey" FOREIGN KEY ("textChannelId") REFERENCES "TextChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
