#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component translations from English version
const componentTranslations = {
  "hero": {
    "tagline": "Unified Large Model Interface Gateway",
    "title": "Better Price",
    "subtitle": "Better Stability",
    "description": "Simply replace the model base URL with our relay interface to get started",
    "description2": "Support for multiple mainstream large models with unified interface format and stable service",
    "viewApiList": "View API List",
    "documentation": "Documentation",
    "realtimeMonitoring": "Real-time Monitoring",
    "highAvailability": "High Availability",
    "competitivePricing": "Competitive Pricing"
  },
  "features": {
    "title": "Why Choose Us",
    "description": "We provide the most comprehensive and professional AI tool navigation service",
    "items": {
      "smartSearch": {
        "title": "Smart Search",
        "description": "Powerful search engine with multi-dimensional filtering to quickly find the AI tools you need"
      },
      "preciseCategories": {
        "title": "Precise Categories",
        "description": "Categorized by function, industry, price and other dimensions for easy browsing of related tools"
      },
      "professionalReview": {
        "title": "Professional Review",
        "description": "Each tool is thoroughly tested and professionally evaluated by our team"
      },
      "realTimeUpdate": {
        "title": "Real-time Update",
        "description": "Daily updates on the latest AI tools to ensure you don't miss any innovative products"
      },
      "secure": {
        "title": "Secure & Reliable",
        "description": "All recommended tools are security audited to protect your data privacy"
      },
      "quickAccess": {
        "title": "Quick Access",
        "description": "One-click access to tool official websites, saving your search time"
      }
    }
  },
  "howItWorks": {
    "title": "How It Works",
    "description": "Three simple steps to find the most suitable AI tools for you",
    "steps": {
      "browse": {
        "title": "Browse & Search",
        "description": "Browse by category or use the search function to quickly find the type of AI tools you need"
      },
      "details": {
        "title": "View Details",
        "description": "Read detailed tool introductions, feature lists, user reviews and professional evaluations"
      },
      "start": {
        "title": "Get Started",
        "description": "One-click access to the tool's official website, start using it immediately to improve your work efficiency"
      }
    }
  },
  "testimonials": {
    "title": "User Reviews",
    "description": "See how other users rate our service",
    "items": {
      "user1": {
        "name": "Zhang Wei",
        "role": "Product Manager",
        "company": "Tech Company",
        "content": "This platform has saved me a lot of time finding AI tools. The reviews for each tool are very professional and detailed. Highly recommended!"
      },
      "user2": {
        "name": "Li Na",
        "role": "Designer",
        "company": "Design Studio",
        "content": "As a designer, I often need to use various AI tools. This navigation website helps me quickly find the most suitable tools, greatly improving work efficiency."
      },
      "user3": {
        "name": "Wang Qiang",
        "role": "Entrepreneur",
        "company": "Startup",
        "content": "Clear categories, timely updates, and detailed introductions for each tool. For our startup team that needs rapid iteration, this platform is extremely valuable."
      }
    }
  },
  "faq": {
    "title": "Frequently Asked Questions",
    "description": "Common questions and answers about AI Navigation",
    "items": {
      "q1": {
        "question": "What is AI Navigation?",
        "answer": "AI Navigation is a professional AI tool aggregation platform that carefully curates and continuously updates the world's best AI tools and websites, helping users quickly find the most suitable AI solutions."
      },
      "q2": {
        "question": "What's the difference between free and paid versions?",
        "answer": "The free version provides access to 200+ basic AI tools and basic search functionality. The paid version provides access to all 500+ tools, advanced search, professional evaluation reports, priority customer support and more."
      },
      "q3": {
        "question": "How do you ensure the quality of recommended tools?",
        "answer": "Our professional team conducts in-depth testing and evaluation of each tool, including functionality, usability, security and other dimensions. Only tools that pass strict review are included in our platform."
      },
      "q4": {
        "question": "How often are tools updated?",
        "answer": "We update platform content daily, including new tools, updated tool information, and user reviews. Professional plan users also receive weekly curated recommendations."
      },
      "q5": {
        "question": "Can I request a refund?",
        "answer": "We offer a 7-day no-questions-asked refund guarantee. If you're not satisfied with our service, you can request a full refund within 7 days of purchase."
      },
      "q6": {
        "question": "What special services does the enterprise plan include?",
        "answer": "In addition to all the features of the professional plan, the enterprise plan includes team collaboration features, customized recommendations, dedicated account manager, API access, enterprise-grade security assurance, and customized training services."
      }
    }
  },
  "monitor": {
    "title": "API Interface Monitoring Dashboard",
    "description": "Real-time monitoring of relay interface availability",
    "stats": {
      "totalSites": "Total Sites",
      "lastUpdate": "Last Update"
    },
    "status": {
      "online": "Online",
      "offline": "Offline"
    },
    "serviceCard": {
      "inviteLink": "Invite Link",
      "responseTime": "Response Time",
      "lastCheck": "Last Check"
    }
  }
};

// Language codes and their file paths
const languages = [
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }
];

// Function to add component translations to a JSON file
function addComponentTranslations(filePath) {
  try {
    // Read the existing JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    // Add component translations with English as fallback
    Object.keys(componentTranslations).forEach(key => {
      if (!json[key]) {
        json[key] = componentTranslations[key];
      }
    });

    // Write back to file with proper formatting
    const newContent = JSON.stringify(json, null, 2);
    fs.writeFileSync(filePath, newContent + '\n');

    console.log(`✅ Successfully added component translations to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all language files
console.log('🚀 Adding component translations to all language files...\n');

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang.code}.json`);
  addComponentTranslations(filePath);
});

console.log('\n✨ All done! Component translations have been added to all language files.');
console.log('\n📝 Note: The translations are currently in English.');
console.log('You can now update the translations in each language file with your preferred translations.');
