import { config } from 'dotenv';
import { BotConfig, MessageTemplates, KeyboardLayout } from '@/types/bot.types';

// Load environment variables from the project root
config();

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Bot configuration
export const botConfig: BotConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN!,
  username: process.env.BOT_USERNAME,
  environment: (process.env.NODE_ENV as any) || 'development',
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
  
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20'),
  },
  
  webhook: process.env.WEBHOOK_URL ? {
    url: process.env.WEBHOOK_URL,
    secret: process.env.WEBHOOK_SECRET,
    port: parseInt(process.env.WEBHOOK_PORT || '3000'),
  } : undefined,
  
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
  },
};

// Bot commands configuration
export const botCommands = [
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Show help information' },
  { command: 'settings', description: 'Bot settings' },
  { command: 'about', description: 'About this bot' },
  { command: 'cancel', description: 'Cancel current operation' },
];

// Message templates
export const messages: MessageTemplates = {
  welcome: `
🤖 <b>Welcome to the Bot!</b>

Hello! 👋 I'm here to help you with hot reload enabled!

💡 <b>Available commands:</b>
/help - Show help information
/settings - Bot settings
/about - About this bot

🚀 <b>Get started with /help</b>
🔥 <b>Hot reload is active!</b>
  `,
  
  help: `
<b>🛠 Bot Commands:</b>

/start - Start the bot
/help - Show this help
/settings - Bot settings
/about - About this bot
/cancel - Cancel operation

<b>💡 Tips:</b>
• Use buttons for navigation
• Type /cancel to stop any operation
• Report issues with /support
  `,

  about: `
<b>🤖 About This Bot</b>

This is a Grammy.js Telegram bot template with:

✅ TypeScript support
✅ tsx for fast development
✅ Rate limiting
✅ Session management
✅ Error handling
✅ Conversation flows

Built with ❤️ using Grammy.js framework
  `,
  
  error: '❌ An error occurred. Please try again or contact support.',
  
  maintenance: '🛠 Bot is under maintenance. Please try again later.',
  
  rateLimitExceeded: '⚠️ Too many requests! Please wait before sending another command.',

  invalidCommand: '❓ I don\'t understand that command. Use /help to see available commands.',

  cancelled: '✅ Operation cancelled.',

  settingsMenu: `
<b>⚙️ Bot Settings</b>

Current settings:
• Language: English
• Notifications: Enabled

Use the buttons below to change settings:
  `,
};

// Inline keyboard templates
export const keyboards: Record<string, KeyboardLayout> = {
  mainMenu: {
    inline_keyboard: [
      [
        { text: '⚙️ Settings', callback_data: 'action:settings' },
        { text: '📋 Help', callback_data: 'action:help' },
      ],
      [
        { text: 'ℹ️ About', callback_data: 'action:about' },
      ],
    ],
  },
  
  settings: {
    inline_keyboard: [
      [
        { text: '🌐 Language', callback_data: 'settings:language' },
        { text: '🔔 Notifications', callback_data: 'settings:notifications' },
      ],
      [
        { text: '🔙 Back', callback_data: 'action:main' },
      ],
    ],
  },

  language: {
    inline_keyboard: [
      [
        { text: '🇺🇸 English', callback_data: 'lang:en' },
        { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
      ],
      [
        { text: '🇪🇸 Español', callback_data: 'lang:es' },
        { text: '🇫🇷 Français', callback_data: 'lang:fr' },
      ],
      [
        { text: '🔙 Back', callback_data: 'action:settings' },
      ],
    ],
  },
  
  backButton: {
    inline_keyboard: [
      [{ text: '🔙 Back', callback_data: 'action:back' }],
    ],
  },

  cancel: {
    inline_keyboard: [
      [{ text: '❌ Cancel', callback_data: 'action:cancel' }],
    ],
  },

};

// Default session data
export const defaultSessionData = {
  userState: 'idle' as const,
  languageCode: 'en',
  lastActivity: Date.now(),
  messageCount: 0,
  joinedAt: Date.now(),
};

// Admin configuration
export const adminConfig = {
  adminIds: process.env.ADMIN_IDS?.split(',').map(Number) || [],
  supportChatId: process.env.SUPPORT_CHAT_ID ? Number(process.env.SUPPORT_CHAT_ID) : undefined,
};

export default botConfig; 