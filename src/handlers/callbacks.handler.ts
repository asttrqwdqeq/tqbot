import { BotContext } from '@/types/bot.types';
import { messages, keyboards } from '@/config/bot.config';
import { logUserAction } from '@/utils/logger';

/**
 * Main callback query handler
 */
export async function callbackQueryHandler(ctx: BotContext) {
  if (!ctx.callbackQuery?.data) return;

  const callbackData = ctx.callbackQuery.data;
  const userId = ctx.from?.id;

  logUserAction('callback_query', userId, { data: callbackData });

  // Answer the callback query to remove loading state
  await ctx.answerCallbackQuery();

  // Parse callback data
  const [action, ...params] = callbackData.split(':');

  try {
    switch (action) {
      case 'action':
        await handleActionCallback(ctx, params[0]);
        break;
      
      case 'settings':
        await handleSettingsCallback(ctx, params[0]);
        break;
      
      case 'lang':
        await handleLanguageCallback(ctx, params[0]);
        break;
      
      case 'broadcast':
        await handleBroadcastCallback(ctx, params);
        break;
      
      default:
        await ctx.editMessageText('❓ Unknown action. Please try again.', {
          reply_markup: keyboards.mainMenu,
        });
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    await ctx.editMessageText('❌ An error occurred. Please try again.', {
      reply_markup: keyboards.mainMenu,
    });
  }
}

/**
 * Handle action callbacks (main navigation)
 */
async function handleActionCallback(ctx: BotContext, action: string) {
  switch (action) {
    case 'main':
      await ctx.editMessageText(messages.welcome, {
        parse_mode: 'HTML',
        reply_markup: keyboards.mainMenu,
      });
      break;

    case 'help':
      await ctx.editMessageText(messages.help, {
        parse_mode: 'HTML',
        reply_markup: keyboards.mainMenu,
      });
      break;

    case 'about':
      await ctx.editMessageText(messages.about, {
        parse_mode: 'HTML',
        reply_markup: keyboards.backButton,
      });
      break;

    case 'settings':
      await ctx.editMessageText(messages.settingsMenu, {
        parse_mode: 'HTML',
        reply_markup: keyboards.settings,
      });
      break;

    case 'back':
      await ctx.editMessageText(messages.welcome, {
        parse_mode: 'HTML',
        reply_markup: keyboards.mainMenu,
      });
      break;

    case 'cancel':
      // Reset user state
      if (ctx.session) {
        ctx.session.userState = 'idle';
      }
      await ctx.editMessageText(messages.cancelled, {
        reply_markup: keyboards.mainMenu,
      });
      break;

    case 'retry':
      await ctx.editMessageText('🔄 Please try your last action again.', {
        reply_markup: keyboards.mainMenu,
      });
      break;

    case 'support':
      await ctx.editMessageText(
        '📞 <b>Support</b>\n\nIf you need help, please contact the administrators.',
        {
          parse_mode: 'HTML',
          reply_markup: keyboards.backButton,
        }
      );
      break;

    default:
      await ctx.editMessageText('❓ Unknown action.', {
        reply_markup: keyboards.mainMenu,
      });
  }
}

/**
 * Handle settings callbacks
 */
async function handleSettingsCallback(ctx: BotContext, setting: string) {
  switch (setting) {
    case 'language':
      await ctx.editMessageText(
        '🌐 <b>Language Settings</b>\n\nSelect your preferred language:',
        {
          parse_mode: 'HTML',
          reply_markup: keyboards.language,
        }
      );
      break;

    case 'notifications':
      // Toggle notifications (would typically update database)
      const notificationsEnabled = ctx.session?.notificationsEnabled ?? true;
      ctx.session!.notificationsEnabled = !notificationsEnabled;

      await ctx.editMessageText(
        `🔔 <b>Notifications</b>\n\nNotifications are now <b>${ctx.session!.notificationsEnabled ? 'enabled' : 'disabled'}</b>.`,
        {
          parse_mode: 'HTML',
          reply_markup: keyboards.settings,
        }
      );
      break;

    default:
      await ctx.editMessageText('❓ Unknown setting.', {
        reply_markup: keyboards.settings,
      });
  }
}

/**
 * Handle language callbacks
 */
async function handleLanguageCallback(ctx: BotContext, language: string) {
  const languages = {
    en: '🇺🇸 English',
    ru: '🇷🇺 Русский',
    es: '🇪🇸 Español',
    fr: '🇫🇷 Français',
  };

  const languageName = languages[language as keyof typeof languages];
  
  if (!languageName) {
    await ctx.editMessageText('❓ Unknown language.', {
      reply_markup: keyboards.language,
    });
    return;
  }

  // Update user language preference
  if (ctx.session) {
    ctx.session.languageCode = language;
  }

  logUserAction('language_change', ctx.from?.id, { language });

  await ctx.editMessageText(
    `✅ Language changed to ${languageName}`,
    {
      reply_markup: keyboards.settings,
    }
  );
}

/**
 * Handle broadcast callbacks (admin only)
 */
async function handleBroadcastCallback(ctx: BotContext, params: string[]) {
  const [subAction, timestamp] = params;

  if (subAction === 'confirm') {
    // In a real implementation, this would send the broadcast message
    await ctx.editMessageText(
      '✅ <b>Broadcast Sent</b>\n\nMessage has been sent to all users.',
      {
        parse_mode: 'HTML',
      }
    );
    
    logUserAction('broadcast_sent', ctx.from?.id, { timestamp });
  }
} 