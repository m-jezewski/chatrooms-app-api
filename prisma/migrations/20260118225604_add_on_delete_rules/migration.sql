-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_textChannelId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_textChannelId_fkey" FOREIGN KEY ("textChannelId") REFERENCES "TextChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
