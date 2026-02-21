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
  // Seed offerwalls
  const walls = [
    {
      slug: 'freecash',
      name: 'Freecash',
      description: 'Play games and complete offers to earn rewards',
      icon: '🎮',
      logoUrl: 'https://www.google.com/s2/favicons?domain=freecash.com&sz=128',
      postbackSecret: process.env.FREECASH_POSTBACK_SECRET || 'dev-secret-freecash',
      sortOrder: 1,
    },
    {
      slug: 'playful',
      name: 'Playful',
      description: 'Play games and get rewarded instantly',
      icon: '🕹️',
      logoUrl: 'https://www.google.com/s2/favicons?domain=playfulrewards.com&sz=128',
      postbackSecret: process.env.PLAYFUL_POSTBACK_SECRET || 'dev-secret-playful',
      sortOrder: 2,
    },
    {
      slug: 'tester',
      name: 'Tester',
      description: 'Test apps and earn rewards for your feedback',
      icon: '🧪',
      logoUrl: 'https://www.google.com/s2/favicons?domain=testerup.com&sz=128',
      postbackSecret: process.env.TESTER_POSTBACK_SECRET || 'dev-secret-tester',
      sortOrder: 3,
    },
    {
      slug: 'fluent',
      name: 'Fluent Surveys',
      description: 'Complete surveys and share your opinion for cash',
      icon: '📋',
      logoUrl: 'https://www.google.com/s2/favicons?domain=fluentco.com&sz=128',
      postbackSecret: process.env.FLUENT_POSTBACK_SECRET || 'dev-secret-fluent',
      sortOrder: 4,
    },
  ];

  for (const wall of walls) {
    await prisma.offerWall.upsert({
      where: { slug: wall.slug },
      update: wall,
      create: wall,
    });
  }

  // Seed premium offers
  const offers = [
    {
      slug: 'auto-insurance-quote',
      name: 'Auto Insurance Quote',
      headline: 'Save up to $500 on Auto Insurance',
      description: 'Compare rates from top providers and get a free quote. Earn $50 just for completing your quote!',
      payoutCents: 5000,
      category: 'auto_insurance',
      externalUrl: 'https://example.com/auto-insurance',
      icon: '🚗',
      imageUrl: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
      sortOrder: 1,
    },
    {
      slug: 'credit-card-offer',
      name: 'Premium Credit Card',
      headline: 'Get $200 Cash Back with This Card',
      description: 'Apply for a premium rewards card and earn a sign-up bonus plus cash back on every purchase.',
      payoutCents: 3000,
      category: 'credit_card',
      externalUrl: 'https://example.com/credit-card',
      icon: '💳',
      imageUrl: 'https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=800',
      sortOrder: 2,
    },
    {
      slug: 'home-security',
      name: 'Home Security System',
      headline: 'Protect Your Home — Free Installation',
      description: 'Get a free home security consultation and quote. Professional installation included.',
      payoutCents: 4000,
      category: 'home_security',
      externalUrl: 'https://example.com/home-security',
      icon: '🏠',
      imageUrl: 'https://images.pexels.com/photos/207574/pexels-photo-207574.jpeg?auto=compress&cs=tinysrgb&w=800',
      sortOrder: 3,
    },
  ];

  for (const offer of offers) {
    await prisma.premiumOffer.upsert({
      where: { slug: offer.slug },
      update: offer,
      create: offer,
    });
  }

  // Seed marketing angles
  const angles = [
    {
      slug: 'save-money',
      name: 'Save Money Angle',
      headline: 'Save $500+ on Your Car Insurance',
      subheadline: 'Compare rates from 10+ providers in 2 minutes',
      ctaText: 'Get My Free Quote',
      weight: 3,
    },
    {
      slug: 'quick-easy',
      name: 'Quick & Easy Angle',
      headline: 'Get Your Free Quote in Under 2 Minutes',
      subheadline: 'No commitment, no hassle — just savings',
      ctaText: 'Start Saving Now',
      weight: 2,
    },
    {
      slug: 'comparison',
      name: 'Comparison Angle',
      headline: 'Are You Overpaying for Insurance?',
      subheadline: 'See how much you could save by switching today',
      ctaText: 'Compare Rates Free',
      weight: 1,
    },
  ];

  for (const angle of angles) {
    await prisma.marketingAngle.upsert({
      where: { slug: angle.slug },
      update: angle,
      create: angle,
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
