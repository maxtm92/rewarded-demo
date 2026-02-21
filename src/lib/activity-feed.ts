const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah',
];

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const SOURCES = ['PayPal', 'Bitcoin', 'Amazon', 'Venmo', 'Apple', 'Litecoin', 'Solana', 'Google Play'];
const OFFERWALL_NAMES = ['Freecash', 'Playful', 'Tester', 'Surveys'];

export interface ActivityItem {
  id: string;
  type: 'withdrawal' | 'earning';
  name: string;
  amount: string;
  source: string;
  timeAgo: string;
}

// Simple seeded random for deterministic output within same hour
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateActivityItems(count: number = 20): ActivityItem[] {
  const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const rand = seededRandom(hourSeed);
  const items: ActivityItem[] = [];

  for (let i = 0; i < count; i++) {
    const isWithdrawal = rand() > 0.4;
    const name = `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${LAST_INITIALS[Math.floor(rand() * LAST_INITIALS.length)]}.`;

    let amount: number;
    let source: string;

    if (isWithdrawal) {
      amount = [5, 10, 15, 20, 25, 50][Math.floor(rand() * 6)];
      source = SOURCES[Math.floor(rand() * SOURCES.length)];
    } else {
      amount = parseFloat((rand() * 15 + 0.5).toFixed(2));
      source = OFFERWALL_NAMES[Math.floor(rand() * OFFERWALL_NAMES.length)];
    }

    const minutesAgo = Math.floor(rand() * 58) + 1;

    items.push({
      id: `feed-${hourSeed}-${i}`,
      type: isWithdrawal ? 'withdrawal' : 'earning',
      name,
      amount: `$${amount.toFixed(2)}`,
      source,
      timeAgo: minutesAgo < 60 ? `${minutesAgo}m ago` : '1h ago',
    });
  }

  return items;
}
