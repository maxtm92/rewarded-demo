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
      postbackSecret: process.env.FREECASH_POSTBACK_SECRET || 'dev-secret-freecash',
      sortOrder: 1,
    },
    {
      slug: 'playful',
      name: 'Playful',
      description: 'Play games and get rewarded instantly',
      icon: '🕹️',
      postbackSecret: process.env.PLAYFUL_POSTBACK_SECRET || 'dev-secret-playful',
      sortOrder: 2,
    },
    {
      slug: 'tester',
      name: 'Tester',
      description: 'Test apps and earn rewards for your feedback',
      icon: '🧪',
      postbackSecret: process.env.TESTER_POSTBACK_SECRET || 'dev-secret-tester',
      sortOrder: 3,
    },
    {
      slug: 'fluent',
      name: 'Fluent Surveys',
      description: 'Complete surveys and share your opinion for cash',
      icon: '📋',
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

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
