import { PrismaClient } from '@prisma/client';
import { getHashedPassword } from '../utils/bcrypt';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      password: getHashedPassword('admin'),
    },
  });
  const publicUser = await prisma.user.upsert({
    where: { email: 'public_user@textChannels.com' },
    update: {},
    create: {
      email: 'public_user@textChannels.com',
      name: 'Public User',
      password: getHashedPassword('public_user_password'),
      // posts: {
      //   create: [
      //     {
      //       title: 'Follow Prisma on Twitter',
      //       content: 'https://twitter.com/prisma',
      //       published: true,
      //     },
      //     {
      //       title: 'Follow Nexus on Twitter',
      //       content: 'https://twitter.com/nexusgql',
      //       published: true,
      //     },
      //   ],
      // },
    },
  });
  console.log({ admin, publicUser });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
