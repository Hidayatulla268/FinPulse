import { ExpenseCategory, SubscriptionItem, Transaction } from '@/types/finance';

// Merchant rules mapping regex/keywords to categories
const MERCHANT_RULES: { keywords: string[]; category: ExpenseCategory; canonicalName: string }[] = [
  // Quick Commerce & Groceries
  {
    keywords: ['zepto', 'zeptolab', 'zeptonow'],
    category: 'groceries',
    canonicalName: 'Zepto',
  },
  {
    keywords: ['blinkit', 'grofers', 'blinkit commerce'],
    category: 'groceries',
    canonicalName: 'Blinkit',
  },
  {
    keywords: ['instamart', 'swiggy instamart'],
    category: 'groceries',
    canonicalName: 'Swiggy Instamart',
  },
  {
    keywords: ['bigbasket', 'bb daily', 'bbnow', 'supermarket grocery'],
    category: 'groceries',
    canonicalName: 'BigBasket',
  },
  {
    keywords: ['nature basket', 'reliance fresh', 'dmart', 'more retail'],
    category: 'groceries',
    canonicalName: 'DMart / Supermarket',
  },

  // Food & Dining
  {
    keywords: ['swiggy', 'bundl technologies'],
    category: 'food',
    canonicalName: 'Swiggy',
  },
  {
    keywords: ['zomato', 'zomato gold', 'zomato limited'],
    category: 'food',
    canonicalName: 'Zomato',
  },
  {
    keywords: ['starbucks', 'tata starbucks'],
    category: 'food',
    canonicalName: 'Starbucks',
  },
  {
    keywords: ['eatclub', 'box8', 'mojo pizza'],
    category: 'food',
    canonicalName: 'EatClub',
  },
  {
    keywords: ['mcdonald', 'burger king', 'kfc', 'dominos', 'pizza hut', 'subway'],
    category: 'food',
    canonicalName: 'Fast Food Chains',
  },
  {
    keywords: ['chaayos', 'chai point', 'chai tapri', 'tea post'],
    category: 'food',
    canonicalName: 'Chai & Cafes',
  },

  // Travel & Commute
  {
    keywords: ['uber', 'uber india'],
    category: 'commute',
    canonicalName: 'Uber',
  },
  {
    keywords: ['ola', 'ani technologies', 'ola cabs'],
    category: 'commute',
    canonicalName: 'Ola Cabs',
  },
  {
    keywords: ['rapido', 'roppen transportation'],
    category: 'commute',
    canonicalName: 'Rapido Bike Taxi',
  },
  {
    keywords: ['namma yatri', 'nammayatri'],
    category: 'commute',
    canonicalName: 'Namma Yatri',
  },
  {
    keywords: ['irctc', 'indian railway', 'makemytrip', 'cleartrip', 'goibibo', 'indigo', 'air india'],
    category: 'commute',
    canonicalName: 'Travel & Flights/Train',
  },
  {
    keywords: ['metro', 'dmrc', 'bmrc', 'mmrcl', 'fastag', 'hpcl', 'iocl', 'bpcl', 'petrol pump'],
    category: 'commute',
    canonicalName: 'Metro & Fuel',
  },

  // Shopping & E-Commerce
  {
    keywords: ['amazon', 'amzn', 'amazon pay', 'amazon seller'],
    category: 'shopping',
    canonicalName: 'Amazon India',
  },
  {
    keywords: ['flipkart', 'fk internet'],
    category: 'shopping',
    canonicalName: 'Flipkart',
  },
  {
    keywords: ['myntra', 'myntra designs'],
    category: 'shopping',
    canonicalName: 'Myntra',
  },
  {
    keywords: ['ajio', 'reliance retail ajio'],
    category: 'shopping',
    canonicalName: 'Ajio',
  },
  {
    keywords: ['nykaa', 'fsn e-commerce'],
    category: 'shopping',
    canonicalName: 'Nykaa',
  },
  {
    keywords: ['zara', 'h&m', 'uniqlo', 'snitch', 'tata cliq'],
    category: 'shopping',
    canonicalName: 'Fashion & Apparel',
  },

  // Subscriptions & OTT
  {
    keywords: ['netflix', 'netflix entertainment'],
    category: 'subscriptions',
    canonicalName: 'Netflix India',
  },
  {
    keywords: ['spotify', 'spotify india'],
    category: 'subscriptions',
    canonicalName: 'Spotify',
  },
  {
    keywords: ['hotstar', 'disney+ hotstar', 'jiohotstar', 'jiocinema'],
    category: 'subscriptions',
    canonicalName: 'JioCinema / Hotstar',
  },
  {
    keywords: ['youtube premium', 'google youtube'],
    category: 'subscriptions',
    canonicalName: 'YouTube Premium',
  },
  {
    keywords: ['prime video', 'amazon digital'],
    category: 'subscriptions',
    canonicalName: 'Amazon Prime',
  },
  {
    keywords: ['cult.fit', 'curefit', 'cultpass'],
    category: 'subscriptions',
    canonicalName: 'Cult.fit Gym',
  },
  {
    keywords: ['apple.com/bill', 'apple services', 'icloud'],
    category: 'subscriptions',
    canonicalName: 'Apple iCloud / App Store',
  },
  {
    keywords: ['openai', 'chatgpt', 'google one'],
    category: 'subscriptions',
    canonicalName: 'AI & Cloud Subscriptions',
  },

  // Utilities & Recharges
  {
    keywords: ['airtel', 'bharti airtel'],
    category: 'utilities',
    canonicalName: 'Airtel Bill / Recharge',
  },
  {
    keywords: ['jio', 'reliance jio'],
    category: 'utilities',
    canonicalName: 'Jio Recharge',
  },
  {
    keywords: ['bescom', 'mseb', 'tata power', 'adani electricity', 'cesc'],
    category: 'utilities',
    canonicalName: 'Electricity Bill',
  },
  {
    keywords: ['act fibernet', 'hathway', 'tata play', 'dish tv'],
    category: 'utilities',
    canonicalName: 'WiFi & DTH',
  },

  // Health
  {
    keywords: ['apollo', 'apollo pharmacy', '1mg', 'tata 1mg', 'pharmeasy', 'practo', 'medplus'],
    category: 'health',
    canonicalName: 'Pharmacy & Health',
  },

  // Random UPI / Tapri
  {
    keywords: ['tapri', 'paan', 'pan shop', 'kirana', 'general store', 'corner store', 'chai stall', 'bhaiya'],
    category: 'random_upi',
    canonicalName: 'Local Tapri / Kirana UPI',
  },
];

/**
 * Identify merchant and category from transaction title or raw bank narration
 */
export function identifyMerchantAndCategory(text: string): {
  merchant: string;
  category: ExpenseCategory;
  isQuickCommerce: boolean;
} {
  const normalized = text.toLowerCase().trim();

  for (const rule of MERCHANT_RULES) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return {
          merchant: rule.canonicalName,
          category: rule.category,
          isQuickCommerce: rule.canonicalName === 'Zepto' || rule.canonicalName === 'Blinkit' || rule.canonicalName === 'Swiggy Instamart',
        };
      }
    }
  }

  // Fallbacks based on common narration fragments
  if (normalized.includes('upi') || normalized.includes('p2p') || normalized.includes('qr scan')) {
    // Check if there is an intelligible name in UPI string e.g. "UPI-RAMESH-BHAIYA@OKAXIS"
    const upiMatch = text.match(/UPI[-/]([A-Za-z0-9\s._]+?)[-/|@]/);
    const candidate = upiMatch && upiMatch[1] ? upiMatch[1].trim() : text;
    return {
      merchant: candidate.length > 2 && candidate.length < 30 ? candidate : 'Local UPI Scan',
      category: 'random_upi',
      isQuickCommerce: false,
    };
  }

  // Generic fallback
  return {
    merchant: text.slice(0, 32),
    category: 'shopping',
    isQuickCommerce: false,
  };
}

/**
 * Detect impulsive buying patterns based on time and merchant
 */
export function checkIsImpulseBuy(timeStr: string, merchant: string, amount: number, dailyAllowance: number): boolean {
  // Late night impulse zone (10:30 PM to 4:30 AM)
  const hour = parseInt(timeStr.split(':')[0], 10);
  const minute = parseInt(timeStr.split(':')[1] || '0', 10);
  const timeInMinutes = hour * 60 + minute;
  const isLateNight = timeInMinutes >= 22 * 60 + 30 || timeInMinutes <= 4 * 60 + 30;

  const impulsiveMerchants = ['Swiggy', 'Zomato', 'Zepto', 'Blinkit', 'Amazon India', 'Myntra', 'Zara'];
  const matchesImpulsiveMerchant = impulsiveMerchants.some((m) =>
    merchant.toLowerCase().includes(m.toLowerCase())
  );

  // If late night + food or quick commerce -> high probability impulse
  if (isLateNight && matchesImpulsiveMerchant) {
    return true;
  }

  // If single order burns more than 60% of the daily allowance
  if (dailyAllowance > 0 && amount >= dailyAllowance * 0.6 && matchesImpulsiveMerchant) {
    return true;
  }

  return false;
}

/**
 * Format Indian Rupee currency with Indian numbering (e.g. ₹1,50,000)
 */
export function formatINR(amount: number, includeDecimals = false): string {
  if (isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(absVal);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Detect subscriptions from recurring transactions
 */
export function detectSubscriptionsFromTransactions(transactions: Transaction[]): SubscriptionItem[] {
  const knownSubs: Record<string, { merchant: string; category: string; amount: number; url: string; icon: string }> = {
    'netflix': {
      merchant: 'Netflix India',
      category: 'Entertainment',
      amount: 649,
      url: 'https://www.netflix.com/youraccount',
      icon: 'Tv',
    },
    'spotify': {
      merchant: 'Spotify Premium',
      category: 'Music',
      amount: 119,
      url: 'https://www.spotify.com/account/subscription/',
      icon: 'Music',
    },
    'youtube': {
      merchant: 'YouTube Premium',
      category: 'Video',
      amount: 149,
      url: 'https://www.youtube.com/paid_memberships',
      icon: 'Youtube',
    },
    'hotstar': {
      merchant: 'JioCinema / Hotstar',
      category: 'Entertainment',
      amount: 299,
      url: 'https://www.hotstar.com/in/subscribe/my-account',
      icon: 'Film',
    },
    'amazon digital': {
      merchant: 'Amazon Prime',
      category: 'Shopping & OTT',
      amount: 299,
      url: 'https://www.amazon.in/mc/manage',
      icon: 'Package',
    },
    'cult.fit': {
      merchant: 'Cult.fit Pass',
      category: 'Fitness',
      amount: 1499,
      url: 'https://www.cult.fit/me/memberships',
      icon: 'Activity',
    },
    'apple': {
      merchant: 'Apple iCloud+ & Music',
      category: 'Cloud Storage',
      amount: 75,
      url: 'https://support.apple.com/billing',
      icon: 'Cloud',
    },
    'openai': {
      merchant: 'ChatGPT Plus',
      category: 'Productivity',
      amount: 1999,
      url: 'https://chat.openai.com/#settings',
      icon: 'Sparkles',
    },
  };

  const detected: SubscriptionItem[] = [];

  for (const [key, sub] of Object.entries(knownSubs)) {
    const hasMatch = transactions.some((t) => t.merchant.toLowerCase().includes(key) || t.title.toLowerCase().includes(key));
    if (hasMatch) {
      detected.push({
        id: `sub_${key}`,
        merchant: sub.merchant,
        amount: sub.amount,
        cycle: 'monthly',
        nextBillingDate: 'In 6 days (28th of this month)',
        category: sub.category,
        directCancelUrl: sub.url,
        iconName: sub.icon,
        active: true,
        detectedFromTxn: true,
      });
    }
  }

  return detected;
}
