#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the pages translation structure
const pagesTranslations = {
  "aiTools": {
    "title": "Large Model Interface Gateway Navigation",
    "description": "Discover the latest and hottest AI tools, large model interface gateways, ChatGPT mirror sites to boost your productivity",
    "searchPlaceholder": "Search AI tools...",
    "noResultsTitle": "No tools found",
    "noResultsDescription": "Try adjusting your search keywords or selecting another category",
    "toolsCount": "Total {count} AI tools collected",
    "showingCount": " · Currently showing {count}"
  },
  "apiMonitor": {
    "title": "Claude Code Relay Monitoring Dashboard",
    "description": "Real-time monitoring of Claude Code relay service status"
  },
  "backlinks": {
    "title": "Best Free Guest Post Submission Sites Analysis (2025)",
    "description": "Comprehensive analysis and comparison of free guest post submission sites. Sites are ranked by review rate, submission speed, and review process.",
    "banner": "Boost your website domain rating to {value1} in just {value2}, completely {value3}",
    "shareButtons": {
      "email": "Email",
      "twitter": "Twitter",
      "facebook": "Facebook",
      "linkedin": "LinkedIn",
      "wechat": "WeChat",
      "telegram": "Telegram",
      "more": "More"
    },
    "table": {
      "rank": "Rank",
      "recommended": "Recommended",
      "website": "Website",
      "category": "Category",
      "contentPositioning": "Content Positioning",
      "contentPositioningTooltip": "Suitable content types and angles for this website",
      "mainContact": "Main Contact",
      "actions": "Actions",
      "visitSubmissionPage": "Visit Submission Page",
      "highlyRecommended": "Highly Recommended"
    },
    "aboutTitle": "About This List",
    "aboutDescription": "This list contains {count} verified guest post submission sites. Each site has been carefully evaluated, including its category classification, review difficulty, submission requirements and other key metrics. Regularly updated to ensure information accuracy."
  },
  "chatgptMirrors": {
    "title": "ChatGPT Mirror Navigation",
    "description": "Curated high-quality ChatGPT, Claude and other AI chat mirror sites, accessible without VPN",
    "statusCounts": {
      "online": "Online",
      "unstable": "Unstable",
      "offline": "Offline"
    },
    "searchPlaceholder": "Search mirror sites...",
    "filterButtons": {
      "all": "All",
      "onlineOnly": "Online Only",
      "unstable": "Unstable",
      "freeOnly": "Free Only"
    },
    "noResultsTitle": "No mirror sites found",
    "noResultsDescription": "Try adjusting your search keywords or filter criteria",
    "mirrorsCount": "Total {count} mirror sites collected",
    "showingCount": " · Currently showing {count}",
    "usageInstructions": "Usage Instructions",
    "usageNotes": [
      "Mirror sites are provided by third parties, please evaluate security before use",
      "Some sites may require registration or login to use",
      "The stability of mirror sites may change at any time, please note backup options",
      "Do not enter sensitive information or important data on mirror sites",
      "This site only provides navigation services and is not responsible for the content and services of mirror sites"
    ]
  },
  "configGuide": {
    "title": "Configuration Guide",
    "description": "Simple configuration to use AI interface relay service",
    "backToHome": "Back to Home",
    "steps": {
      "step1": {
        "title": "Select a relay service provider and register",
        "description": "Select an online service provider from the homepage monitoring panel and click the invitation link to register an account",
        "tip": "It is recommended to choose a service provider with online status and low response time",
        "viewMonitorPanel": "View Monitoring Panel"
      },
      "step2": {
        "title": "Get API Key",
        "description": "After registering and logging in, get your API Key from the {apiToken} page in the service provider's backend",
        "stepsTitle": "Steps:",
        "steps": [
          "Click the {addToken} button",
          "Fill in the name freely, it is recommended to set the quota to {unlimitedQuota}",
          "Keep other options at default settings",
          "The obtained API Key starts with {codeSk}"
        ],
        "warning": "Please keep your API Key safe and do not share it with others"
      },
      "step3": {
        "title": "Configure Environment Variables",
        "description": "Configure API Key and Base URL in your project",
        "methods": {
          "method1": {
            "title": "Method 1: Using environment variables (recommended)",
            "codeBlockTitle": "Set API Key and Base URL (using anyrouter as example)"
          },
          "method2": {
            "title": "Method 2: Configure in code (Python)",
            "codeBlockTitle": "Python configuration example"
          },
          "method3": {
            "title": "Method 3: Configure in code (Node.js)",
            "codeBlockTitle": "Node.js configuration example"
          },
          "method4": {
            "title": "Method 4: Use cURL for testing",
            "codeBlockTitle": "cURL test example"
          }
        }
      },
      "step4": {
        "title": "Start Using",
        "description": "After configuration, you can use the relay service just like the original OpenAI API",
        "tipTitle": "Tip:",
        "tipDescription": "All relay services are fully compatible with OpenAI official API format, no need to modify code logic",
        "supportedModels": "Supported mainstream models:"
      }
    },
    "notes": {
      "title": "⚠️ Notes",
      "items": [
        "Please keep your API Key safe and do not share it with others or submit it to public code repositories",
        "It is recommended to choose stable online service providers from the monitoring panel",
        "Different service providers may have different pricing and supported models, please check the service provider's instructions carefully",
        "API Base URL usually ends with {codeV1}",
        "If you encounter problems, you can click the \"Join Group\" button in the top right corner to join the QQ group for help"
      ]
    }
  },
  "keywordTool": {
    "title": "Google Keyword Search Volume Batch Query Tool",
    "description": "Enter keywords to get monthly search volume, CPC and competition data at once",
    "buttons": {
      "startQuery": "Start Query",
      "clearing": "Clearing...",
      "querying": "Querying...",
      "clear": "Clear"
    },
    "statusMessages": {
      "enterAtLeastOneKeyword": "Please enter at least one keyword",
      "querying": "Querying batch {current}/{total} ({count} keywords)...",
      "batchFailed": "Batch {batchNumber} query failed: {error}",
      "queryCompleted": "Query completed! Successfully retrieved {count}/{total} keyword data",
      "queryError": "Query error: {error}",
      "queryInProgress": "Query in progress, are you sure you want to clear?",
      "queryingPleaseWait": "Querying, please wait..."
    },
    "stats": {
      "total": "Total",
      "success": "Success",
      "failed": "Failed"
    }
  },
  "vpn": {
    "title": "VPN Recommendations",
    "description": "Curated high-quality VPN services to help you safely and stably access the global Internet",
    "evaluationBasis": "Based on speed, stability, privacy protection and other multi-dimensional evaluations",
    "searchPlaceholder": "Search VPN services...",
    "sortButtons": {
      "default": "Default Sort",
      "byRating": "By Rating",
      "byPrice": "By Price"
    },
    "noResultsTitle": "No related VPN services found",
    "noResultsDescription": "Try adjusting your search keywords",
    "stats": {
      "totalRecommended": "Total {count} high-quality VPN services recommended",
      "currentlyShowing": " · Currently showing {count}"
    },
    "selectionGuide": {
      "title": "How to choose the right VPN?",
      "speedPriority": "Speed Priority: If mainly used for watching videos and downloading, choose ExpressVPN or StrongVPN",
      "privacyPriority": "Privacy Priority: If focusing on privacy protection, recommend PrivateVPN or NordVPN",
      "valuePriority": "Value Priority: Just My Socks and Lantern provide excellent value for money",
      "chinaUsers": "China Users: StrongVPN (supports Alipay) and Astrill VPN (China专线) are most suitable"
    },
    "disclaimer": {
      "title": "Important Notice",
      "items": [
        "The availability of VPN services may vary by region and time, it is recommended to choose services with refund guarantees",
        "Please abide by local laws and regulations when using VPN, use only for legal purposes",
        "Some VPNs may require special configuration to work in China, please consult customer service before purchase",
        "Price information may change at any time, subject to the actual price on the official website",
        "It is recommended to prioritize services that offer free trials or refund guarantees, test before buying",
        "Do not perform sensitive operations (such as online banking) while connected to VPN unless you confirm the VPN is safe and reliable"
      ]
    }
  }
};

// Language codes and their file paths
const languages = [
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

// Function to add pages namespace to a JSON file
function addPagesNamespace(filePath) {
  try {
    // Read the existing JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    // Add the pages namespace with English translations as fallback
    json.pages = pagesTranslations;

    // Write back to file with proper formatting
    const newContent = JSON.stringify(json, null, 2);
    fs.writeFileSync(filePath, newContent + '\n');

    console.log(`✅ Successfully added pages namespace to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all language files
console.log('🚀 Adding pages namespace to all language files...\n');

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang.code}.json`);
  addPagesNamespace(filePath);
});

console.log('\n✨ All done! You can now use the pages translations in your components.');
console.log('\n📝 Next steps:');
console.log('1. Update the translations in each language file with your preferred translations');
console.log('2. Update your page components to use useTranslations("pages")');
console.log('3. Test the translations in your application');
