import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed offerwalls (FreeCash + Playful only, with Everflow integration)
  const walls = [
    {
      slug: 'freecash',
      name: 'Freecash',
      description: 'Play games and complete offers to earn $10 per offer',
      icon: '🎮',
      logoUrl: 'https://www.google.com/s2/favicons?domain=freecash.com&sz=128',
      postbackSecret: process.env.FREECASH_POSTBACK_SECRET || 'dev-secret-freecash',
      everflowOfferId: process.env.FREECASH_EVERFLOW_OFFER_ID || null,
      everflowAffId: process.env.FREECASH_EVERFLOW_AFF_ID || null,
      bonusText: '$10',
      bonusDetail: 'Complete 1 offer to claim $10',
      isFeatured: true,
      sortOrder: 1,
    },
    {
      slug: 'playful',
      name: 'Playful',
      description: 'Play games and get rewarded — $10 per completed offer',
      icon: '🕹️',
      logoUrl: 'https://www.google.com/s2/favicons?domain=playfulrewards.com&sz=128',
      postbackSecret: process.env.PLAYFUL_POSTBACK_SECRET || 'dev-secret-playful',
      everflowOfferId: process.env.PLAYFUL_EVERFLOW_OFFER_ID || null,
      everflowAffId: process.env.PLAYFUL_EVERFLOW_AFF_ID || null,
      bonusText: '$10',
      bonusDetail: 'Complete 1 offer to claim $10',
      sortOrder: 2,
    },
  ];

  for (const wall of walls) {
    await prisma.offerWall.upsert({
      where: { slug: wall.slug },
      update: wall,
      create: wall,
    });
  }

  // Seed achievements
  const achievements = [
    { slug: 'first-earning',    name: 'First Dollar',    description: 'Complete your first offer',       icon: '🌟', category: 'earning',    threshold: 1,      sortOrder: 1 },
    { slug: 'earned-10',        name: 'Ten Bucks',       description: 'Earn $10 total',                  icon: '💵', category: 'earning',    threshold: 1000,   sortOrder: 2 },
    { slug: 'earned-100',       name: 'Benjamin',        description: 'Earn $100 total',                 icon: '💰', category: 'earning',    threshold: 10000,  sortOrder: 3 },
    { slug: 'earned-500',       name: 'High Roller',     description: 'Earn $500 total',                 icon: '🤑', category: 'earning',    threshold: 50000,  sortOrder: 4 },
    { slug: 'earned-1000',      name: 'Thousandaire',    description: 'Earn $1,000 total',               icon: '👑', category: 'earning',    threshold: 100000, sortOrder: 5 },
    { slug: 'first-withdrawal', name: 'Cashed Out',      description: 'Complete your first withdrawal',  icon: '🏧', category: 'withdrawal', threshold: 1,      sortOrder: 6 },
    { slug: 'streak-3',         name: 'Hat Trick',       description: '3-day login streak',              icon: '🔥', category: 'streak',     threshold: 3,      sortOrder: 7 },
    { slug: 'streak-7',         name: 'On Fire',         description: '7-day login streak',              icon: '🔥', category: 'streak',     threshold: 7,      sortOrder: 8 },
    { slug: 'streak-30',        name: 'Dedicated',       description: '30-day login streak',             icon: '⚡', category: 'streak',     threshold: 30,     sortOrder: 9 },
    { slug: 'referral-1',       name: 'Networker',       description: 'Refer your first friend',         icon: '🤝', category: 'referral',   threshold: 1,      sortOrder: 10 },
    { slug: 'referral-5',       name: 'Influencer',      description: 'Refer 5 friends',                 icon: '📣', category: 'referral',   threshold: 5,      sortOrder: 11 },
    { slug: 'referral-10',      name: 'Ambassador',      description: 'Refer 10 friends',                icon: '🏆', category: 'referral',   threshold: 10,     sortOrder: 12 },
    { slug: 'survey-complete',  name: 'Opinionated',     description: 'Complete the profile survey',     icon: '📋', category: 'milestone',  threshold: 1,      sortOrder: 13 },
    { slug: 'offers-10',        name: 'Veteran',         description: 'Complete 10 offers',              icon: '🎯', category: 'milestone',  threshold: 10,     sortOrder: 14 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
