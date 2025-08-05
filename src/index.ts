import { Bot, session } from 'grammy';
import { run } from '@grammyjs/runner';
import { conversations } from '@grammyjs/conversations';

import { BotContext, SessionData } from '@/types/bot.types';
import { botConfig, defaultSessionData, botCommands } from '@/config/bot.config';
import { logger, logBotEvent } from '@/utils/logger';

// Middleware imports
import { 
  errorMiddleware, 
  userValidationMiddleware, 
  commandValidationMiddleware,
  adminMiddleware 
} from '@/middleware/error.middleware';

// Handler imports
import { 
  startCommand, 
  helpCommand, 
  settingsCommand,
  aboutCommand,
  cancelCommand,
  statsCommand,
  broadcastCommand,
  logsCommand
} from '@/handlers/commands.handler';
import { callbackQueryHandler } from '@/handlers/callbacks.handler';

/**
 * Create and configure the bot
 */
function createBot(): Bot<BotContext> {
  logger.info('Creating bot instance', { environment: botConfig.environment });
  
  const bot = new Bot<BotContext>(botConfig.token);
  
  // Set default parse mode
  bot.api.config.use((prev, method, payload, signal) => {
    if ('parse_mode' in payload) {
      payload.parse_mode = payload.parse_mode || 'HTML';
    }
    return prev(method, payload, signal);
  });
  
  // Apply middleware in order
  setupMiddleware(bot);
  
  // Setup command handlers
  setupCommands(bot);
  
  // Setup callback query handlers
  setupCallbackHandlers(bot);
  
  // Setup message handlers
  setupMessageHandlers(bot);
  
  // Setup error handling
  setupErrorHandling(bot);
  
  return bot;
}

/**
 * Setup middleware
 */
function setupMiddleware(bot: Bot<BotContext>) {
  logger.info('Setting up middleware');
  
  // Error handling (should be first)
  bot.use(errorMiddleware);
  
  // User validation
  bot.use(userValidationMiddleware);
  
  // Rate limiting - using simple in-memory implementation
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id?.toString() || 'unknown';
    const now = Date.now();
    const windowDuration = botConfig.rateLimit.window;
    const maxRequests = botConfig.rateLimit.max;
    
    const userLimit = rateLimitStore.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit window
      rateLimitStore.set(userId, {
        count: 1,
        resetTime: now + windowDuration
      });
    } else if (userLimit.count >= maxRequests) {
      // Rate limit exceeded
      await ctx.reply('⚠️ Too many requests! Please wait before sending another command.');
      return;
    } else {
      // Increment count
      userLimit.count++;
    }
    
    await next();
  });
  
  // Session management
  bot.use(session({
    initial: (): SessionData => ({ ...defaultSessionData }),
    storage: undefined, // Use in-memory storage
  }));
  
  // Conversations plugin
  bot.use(conversations());
  
  // Command validation
  bot.use(commandValidationMiddleware);
}

/**
 * Setup command handlers
 */
function setupCommands(bot: Bot<BotContext>) {
  logger.info('Setting up command handlers');
  
  // Public commands
  bot.command('start', startCommand);
  bot.command('help', helpCommand);
  bot.command('settings', settingsCommand);
  bot.command('about', aboutCommand);
  bot.command('cancel', cancelCommand);
  
  // Admin commands (with admin middleware)
  bot.command('stats', adminMiddleware, statsCommand);
  bot.command('broadcast', adminMiddleware, broadcastCommand);
  bot.command('logs', adminMiddleware, logsCommand);
  
  // Debug command for development
  if (botConfig.environment === 'development') {
    bot.command('debug', adminMiddleware, async (ctx) => {
      const debugInfo = {
        userId: ctx.from?.id,
        session: ctx.session,
        environment: botConfig.environment,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };
      
      await ctx.reply(
        `🐛 <b>Debug Info:</b>\n\n<pre>${JSON.stringify(debugInfo, null, 2)}</pre>`,
        { parse_mode: 'HTML' }
      );
    });
  }
}

/**
 * Setup callback query handlers
 */
function setupCallbackHandlers(bot: Bot<BotContext>) {
  logger.info('Setting up callback handlers');
  
  bot.on('callback_query:data', callbackQueryHandler);
}

/**
 * Setup message handlers
 */
function setupMessageHandlers(bot: Bot<BotContext>) {
  logger.info('Setting up message handlers');
  
  // Handle text messages
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    
    // Skip commands (they are handled separately)
    if (text.startsWith('/')) return;
    
    logBotEvent('text_message_received', {
      userId: ctx.from?.id,
      messageLength: text.length,
    });
    
    // Handle based on user state
    if (ctx.session?.userState === 'waiting_input') {
      // Handle user input based on context
      await ctx.reply('✅ Input received! Use /cancel to stop or continue with your action.');
    } else {
      // Default response for unknown text
      await ctx.reply(
        '💬 I received your message! Use /help to see what I can do.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📋 Help', callback_data: 'action:help' }],
              [{ text: '⚙️ Settings', callback_data: 'action:settings' }],
            ],
          },
        }
      );
    }
  });
  
  // Handle other message types
  bot.on('message:photo', async (ctx) => {
    logBotEvent('photo_received', { userId: ctx.from?.id });
    await ctx.reply('📸 Nice photo! I can see it but I don\'t process images yet.');
  });
  
  bot.on('message:document', async (ctx) => {
    logBotEvent('document_received', { userId: ctx.from?.id });
    await ctx.reply('📄 Document received! I don\'t process files yet, but thanks for sharing.');
  });
  
  bot.on('message:sticker', async (ctx) => {
    logBotEvent('sticker_received', { userId: ctx.from?.id });
    await ctx.reply('😄 Great sticker! 👍');
  });
  
  bot.on('message:voice', async (ctx) => {
    logBotEvent('voice_received', { userId: ctx.from?.id });
    await ctx.reply('🎤 Voice message received! I don\'t process audio yet.');
  });
}

/**
 * Setup error handling
 */
function setupErrorHandling(bot: Bot<BotContext>) {
  logger.info('Setting up error handling');
  
  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error('Error in bot update handling', {
      error: err.error instanceof Error ? err.error.message : String(err.error),
      stack: err.error instanceof Error ? err.error.stack : undefined,
      userId: ctx.from?.id,
      chatId: ctx.chat?.id,
      updateType: ctx.update,
    });
  });
}

/**
 * Start the bot
 */
async function startBot() {
  try {
    logBotEvent('bot_starting', { environment: botConfig.environment });
    
    const bot = createBot();
    
    // Set bot commands
    await bot.api.setMyCommands(botCommands);
    logger.info('Bot commands set successfully');
    
    // Get bot info
    const me = await bot.api.getMe();
    logger.info('Bot info retrieved', {
      id: me.id,
      username: me.username,
      firstName: me.first_name,
    });
    
    // Start bot based on environment
    if (botConfig.webhook && botConfig.environment === 'production') {
      // Webhook mode for production
      logger.info('Starting bot in webhook mode', {
        url: botConfig.webhook.url,
        port: botConfig.webhook.port,
      });
      
      // Note: In a real implementation, you would set up webhook here
      // bot.api.setWebhook(botConfig.webhook.url, { secret_token: botConfig.webhook.secret });
      
      logBotEvent('bot_started_webhook');
    } else {
      // Polling mode for development
      logger.info('Starting bot in polling mode');
      
      const runner = run(bot);
      
      // Handle graceful shutdown
      const isRunning = runner.isRunning;
      
      if (isRunning()) {
        logBotEvent('bot_started_polling');
        logger.info('Bot is running in polling mode');
      }
      
      // Graceful shutdown handlers
      const shutdown = async (signal: string) => {
        logger.info(`Received ${signal}, shutting down gracefully...`);
        
        if (isRunning()) {
          await runner.stop();
          logBotEvent('bot_stopped');
          logger.info('Bot stopped successfully');
        }
        
        process.exit(0);
      };
      
      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    }
    
  } catch (error) {
    logger.error('Failed to start bot', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  startBot();
}

export { createBot, startBot };