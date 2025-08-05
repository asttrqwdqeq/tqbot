import { BotContext, BotError, BotErrorType } from '@/types/bot.types';
import { adminConfig } from '@/config/bot.config';
import { logger } from '@/utils/logger';

/**
 * Global error handling middleware
 */
export async function errorMiddleware(ctx: BotContext, next: () => Promise<void>) {
  try {
    await next();
  } catch (error) {
    await handleError(ctx, error);
  }
}

/**
 * Handle different types of errors
 */
async function handleError(ctx: BotContext, error: any) {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  
  logger.error('Bot error occurred', {
    error: error.message,
    stack: error.stack,
    userId,
    chatId,
    updateType: ctx.update,
  });

  // Determine error type
  let errorType: BotErrorType = 'UNKNOWN_ERROR';
  let userMessage = '❌ An error occurred. Please try again later.';

  if (error.message?.includes('rate limit')) {
    errorType = 'RATE_LIMIT_EXCEEDED';
    userMessage = '⚠️ Too many requests! Please wait before sending another command.';
  } else if (error.message?.includes('banned')) {
    errorType = 'USER_BANNED';
    userMessage = '🚫 You are banned from using this bot.';
  } else if (error.message?.includes('network')) {
    errorType = 'NETWORK_ERROR';
    userMessage = '🌐 Network error. Please try again in a moment.';
  } else if (error.message?.includes('configuration')) {
    errorType = 'CONFIGURATION_ERROR';
    userMessage = '⚙️ Bot configuration error. Please contact support.';
  }

  // Create structured error
  const botError: BotError = {
    name: error.name || 'BotError',
    message: error.message || 'Unknown error',
    type: errorType,
    userId,
    chatId: chatId ? Number(chatId) : undefined,
    timestamp: new Date(),
  };

  // Try to send error message to user
  try {
    await ctx.reply(userMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Try Again', callback_data: 'action:retry' }],
          [{ text: '📞 Support', callback_data: 'action:support' }],
        ],
      },
    });
  } catch (replyError) {
    logger.error('Failed to send error message to user', {
      originalError: error.message,
      replyError: replyError instanceof Error ? replyError.message : String(replyError),
      userId,
      chatId,
    });
  }

  // Notify admins for critical errors
  if (errorType === 'CONFIGURATION_ERROR' || errorType === 'UNKNOWN_ERROR') {
    await notifyAdmins(botError);
  }
}

/**
 * Notify admin users about critical errors
 */
async function notifyAdmins(error: BotError) {
  const adminMessage = `
🚨 <b>Bot Error Alert</b>

<b>Type:</b> ${error.type}
<b>Message:</b> ${error.message}
<b>User ID:</b> ${error.userId || 'Unknown'}
<b>Chat ID:</b> ${error.chatId || 'Unknown'}
<b>Time:</b> ${error.timestamp.toISOString()}

<code>${error.message}</code>
  `;

  for (const adminId of adminConfig.adminIds) {
    try {
      // Note: In a real implementation, you would need access to the bot instance
      // This is a placeholder for admin notification
      logger.info('Would notify admin', { adminId, error: error.type });
    } catch (notifyError) {
      logger.error('Failed to notify admin', {
        adminId,
        error: notifyError instanceof Error ? notifyError.message : String(notifyError),
      });
    }
  }
}

/**
 * User validation middleware
 */
export async function userValidationMiddleware(ctx: BotContext, next: () => Promise<void>) {
  const user = ctx.from;
  if (!user) {
    logger.warn('Message received without user information');
    return;
  }

  // Check if user is banned (this would typically check a database or config)
  const bannedUsers = process.env.BANNED_USERS?.split(',').map(Number) || [];
  if (bannedUsers.includes(user.id)) {
    logger.info('Banned user attempted to use bot', { userId: user.id });
    await ctx.reply('🚫 You are banned from using this bot.');
    return;
  }

  // Update user session with latest info
  if (ctx.session) {
    ctx.session.userId = user.id;
    ctx.session.username = user.username;
    ctx.session.firstName = user.first_name;
    ctx.session.lastName = user.last_name;
    ctx.session.languageCode = user.language_code;
    ctx.session.lastActivity = Date.now();
    ctx.session.messageCount = (ctx.session.messageCount || 0) + 1;
  }

  await next();
}

/**
 * Command validation middleware
 */
export async function commandValidationMiddleware(ctx: BotContext, next: () => Promise<void>) {
  // Skip validation for non-command messages
  if (!ctx.message?.text?.startsWith('/')) {
    await next();
    return;
  }

  const command = ctx.message.text.split(' ')[0].substring(1);
  
  // Check if command is valid (basic validation)
  const validCommands = ['start', 'help', 'settings', 'about', 'cancel'];
  
  if (!validCommands.includes(command)) {
    logger.info('Invalid command received', { 
      command, 
      userId: ctx.from?.id,
      chatId: ctx.chat?.id 
    });
    
    await ctx.reply(
      '❓ Unknown command. Use /help to see available commands.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 Help', callback_data: 'action:help' }],
          ],
        },
      }
    );
    return;
  }

  await next();
}

/**
 * Admin check middleware
 */
export async function adminMiddleware(ctx: BotContext, next: () => Promise<void>) {
  const userId = ctx.from?.id;
  
  if (!userId || !adminConfig.adminIds.includes(userId)) {
    await ctx.reply('❌ You don\'t have permission to use this command.');
    logger.warn('Non-admin attempted to use admin command', { userId });
    return;
  }

  await next();
} 