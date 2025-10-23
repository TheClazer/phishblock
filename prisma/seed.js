// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { oauthId: 'github-admin-01' },
    update: {},
    create: {
      oauthProvider: 'github',
      oauthId: 'github-admin-01',
      username: 'phish-admin',
      email: 'admin@example.com',
      reputation: 100
    }
  });

  // Trusted validators
  const v1 = await prisma.user.upsert({
    where: { oauthId: 'github-validator-01' },
    update: {},
    create: {
      oauthProvider: 'github',
      oauthId: 'github-validator-01',
      username: 'validator1',
      email: 'validator1@example.com'
    }
  });

  const v2 = await prisma.user.upsert({
    where: { oauthId: 'github-validator-02' },
    update: {},
    create: {
      oauthProvider: 'github',
      oauthId: 'github-validator-02',
      username: 'validator2',
      email: 'validator2@example.com'
    }
  });

  // Link validators
  await prisma.validator.upsert({
    where: { userId: v1.id },
    update: {},
    create: {
      userId: v1.id,
      weight: 2
    }
  });

  await prisma.validator.upsert({
    where: { userId: v2.id },
    update: {},
    create: {
      userId: v2.id,
      weight: 2
    }
  });

  console.log('✅ Seed complete — admin and validators added.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
