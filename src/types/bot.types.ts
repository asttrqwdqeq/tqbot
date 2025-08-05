import { Context, SessionFlavor } from 'grammy';
import type { ConversationFlavor } from '@grammyjs/conversations';

// Session data interface
export interface SessionData {
  userId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  userState?: 'idle' | 'waiting_input' | 'in_conversation';
  lastActivity?: number;
  messageCount?: number;
  joinedAt?: number;
  // Add more session fields as needed
  [key: string]: any;
}

// Bot context with session and conversation support
export type BotContext = Context & 
  SessionFlavor<SessionData> & 
  ConversationFlavor<Context>;

// Bot configuration interface
export interface BotConfig {
  token: string;
  username?: string;
  environment: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  rateLimit: {
    window: number;    // Window duration in milliseconds
    max: number;       // Max requests per window
  };
  
  webhook?: {
    url: string;
    secret?: string;
    port?: number;
  };
  
  api?: {
    baseUrl?: string;
    timeout?: number;
  };
}

// Command handler type
export type CommandHandler = (ctx: BotContext) => Promise<void>;

// Callback query handler type
export type CallbackHandler = (ctx: BotContext) => Promise<void>;

// Middleware type
export type BotMiddleware = (ctx: BotContext, next: () => Promise<void>) => Promise<void>;

// User information interface
export interface UserInfo {
  id: number;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isBot: boolean;
  isPremium?: boolean;
  lastSeen: Date;
  joinedAt: Date;
}

// Bot interaction tracking
export interface BotInteraction {
  userId: number;
  chatId: number;
  messageType: 'command' | 'text' | 'callback' | 'inline_query';
  command?: string;
  callbackData?: string;
  messageText?: string;
  timestamp: Date;
  isSuccessful: boolean;
  errorMessage?: string;
  processingTime?: number;
}

// Rate limit tracking
export interface RateLimitInfo {
  userId: number;
  chatId: number;
  action: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}

// Bot settings
export interface BotSetting {
  key: string;
  value: string;
  description?: string;
  isActive: boolean;
}

// Admin user
export interface AdminUser {
  telegramId: number;
  username?: string;
  role: 'admin' | 'moderator' | 'support';
  permissions: string[];
  isActive: boolean;
}

// Inline keyboard button
export interface InlineButton {
  text: string;
  callback_data: string;
}

// Keyboard layout
export interface KeyboardLayout {
  inline_keyboard: InlineButton[][];
}

// Message templates
export interface MessageTemplates {
  welcome: string;
  help: string;
  error: string;
  maintenance: string;
  rateLimitExceeded: string;
  [key: string]: string;
}

// Error types
export type BotErrorType = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'USER_BANNED'
  | 'INVALID_COMMAND'
  | 'NETWORK_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface BotError extends Error {
  type: BotErrorType;
  userId?: number;
  chatId?: number;
  command?: string;
  timestamp: Date;
} 