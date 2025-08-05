import { BotContext, CommandHandler } from '@/types/bot.types';
import { messages, keyboards } from '@/config/bot.config';
import { logger, logUserAction } from '@/utils/logger';
import { REQUESTS } from '@/config/requests';
import { post } from '@/services/api/post';

/**
 * /start command handler
 */
export const startCommand: CommandHandler = async (ctx: BotContext) => {
  const user = ctx.from;
  
  logUserAction('start_command', user?.id, {
    username: user?.username,
    firstName: user?.first_name,
  });

  // Initialize session if not exists
  if (!ctx.session.joinedAt) {
    ctx.session.joinedAt = Date.now();
    ctx.session.messageCount = 0;
  }

  // await ctx.reply(messages.welcome, {
  //   parse_mode: 'HTML',
  //   reply_markup: keyboards.mainMenu,
  // });
  const inviterId = ctx.message?.text?.slice(6).trim()
  if (!inviterId) {
    await ctx.reply('Please enter your inviter ID', {
      parse_mode: 'HTML',
    });
    return;
  }
  const req = await post(REQUESTS.AUTH.SIGN_UP, {
    inviterId: inviterId,
    userId: user?.id.toString(),
  })

  if (req.status === 201) {
    await ctx.reply(messages.welcome, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 Open Mini App', web_app: { url: 'https://app.ton-quant.com' } }],
        ],
      },
    });
  } else {
    await ctx.reply(req.data, {
      parse_mode: 'HTML',
    });
  }
  return;
};

/**
 * /help command handler
 */
export const helpCommand: CommandHandler = async (ctx: BotContext) => {
  logUserAction('help_command', ctx.from?.id);

  await ctx.reply(messages.help, {
    parse_mode: 'HTML',
    reply_markup: keyboards.mainMenu,
  });
};

/**
 * /settings command handler
 */
export const settingsCommand: CommandHandler = async (ctx: BotContext) => {
  logUserAction('settings_command', ctx.from?.id);

  await ctx.reply(messages.settingsMenu, {
    parse_mode: 'HTML',
    reply_markup: keyboards.settings,
  });
};

/**
 * /about command handler
 */
export const aboutCommand: CommandHandler = async (ctx: BotContext) => {
  logUserAction('about_command', ctx.from?.id);

  await ctx.reply(messages.about, {
    parse_mode: 'HTML',
    reply_markup: keyboards.backButton,
  });
};

/**
 * /cancel command handler
 */
export const cancelCommand: CommandHandler = async (ctx: BotContext) => {
  logUserAction('cancel_command', ctx.from?.id);

  // Reset user state
  if (ctx.session) {
    ctx.session.userState = 'idle';
  }

  await ctx.reply(messages.cancelled, {
    reply_markup: keyboards.mainMenu,
  });
};

/**
 * Admin commands
 */

/**
 * /stats command handler (admin only)
 */
export const statsCommand: CommandHandler = async (ctx: BotContext) => {
  const userId = ctx.from?.id;
  
  logUserAction('stats_command', userId);

  // This would typically fetch stats from database
  const stats = {
    totalUsers: 0, // Would be fetched from database
    activeUsers: 0,
    totalMessages: 0,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };

  const statsMessage = `
📊 <b>Bot Statistics</b>

👥 <b>Users:</b>
• Total: ${stats.totalUsers}
• Active: ${stats.activeUsers}

💬 <b>Messages:</b>
• Total processed: ${stats.totalMessages}

🕒 <b>System:</b>
• Uptime: ${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m
• Memory: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)}MB

<i>Last updated: ${new Date().toLocaleString()}</i>
  `;

  await ctx.reply(statsMessage, {
    parse_mode: 'HTML',
  });
};

/**
 * /broadcast command handler (admin only)
 */
export const broadcastCommand: CommandHandler = async (ctx: BotContext) => {
  logUserAction('broadcast_command', ctx.from?.id);

  const text = ctx.message?.text?.replace('/broadcast', '').trim();
  
  if (!text) {
    await ctx.reply('Please provide a message to broadcast.\n\nUsage: /broadcast <message>');
    return;
  }

  // In a real implementation, this would send to all users
  // For now, just confirm the command
  await ctx.reply(
    `📢 <b>Broadcast Preview:</b>\n\n${text}\n\n<i>This would be sent to all users.</i>`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm', callback_data: `broadcast:confirm:${Date.now()}` },
            { text: '❌ Cancel', callback_data: 'action:cancel' },
          ],
        ],
      },
    }
  );
};

/**
 * /logs command handler (admin only)
 */
export const logsCommand: CommandHandler = async (ctx: BotContext) => {
  logUserAction('logs_command', ctx.from?.id);

  // This would typically fetch recent logs
  const recentLogs = [
    'No recent errors',
    'System running normally',
  ];

  const logsMessage = `
📋 <b>Recent Logs</b>

${recentLogs.map(log => `• ${log}`).join('\n')}

<i>For detailed logs, check the server console.</i>
  `;

  await ctx.reply(logsMessage, {
    parse_mode: 'HTML',
  });
}; 