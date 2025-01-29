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
      role: 'ADMIN',
    },
  });
  const publicUser = await prisma.user.upsert({
    where: { email: 'public_user@chatrooms.com' },
    update: {},
    create: {
      email: 'public_user@chatrooms.com',
      name: 'Public User',
      password: getHashedPassword('public_user_password'),
      role: 'USER',
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
