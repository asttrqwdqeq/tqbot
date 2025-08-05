# Grammy.js Telegram Bot Template

A modern, production-ready Telegram bot template built with Grammy.js, TypeScript, and tsx for fast development.

## 🚀 Features

- **🤖 Grammy.js Framework** - Modern Telegram Bot API framework
- **📝 TypeScript** - Full type safety and excellent developer experience
- **⚡ tsx** - Lightning-fast TypeScript execution and hot reloading
- **🔄 Session Management** - In-memory session storage with extensible architecture
- **💬 Conversation Flows** - Support for complex multi-step interactions
- **⚡ Rate Limiting** - Built-in spam protection and rate limiting
- **🛡️ Error Handling** - Comprehensive error handling and logging
- **📊 Logging** - Structured logging with Winston
- **🌐 Internationalization** - Multi-language support ready
- **👑 Admin Commands** - Built-in admin functionality
- **🔧 Context7** - Enhanced AI development assistance

## 📁 Project Structure

```
bot/
├── src/
│   ├── config/           # Bot configuration and settings
│   │   └── bot.config.ts
│   ├── handlers/         # Command and callback handlers
│   │   ├── commands.handler.ts
│   │   └── callbacks.handler.ts
│   ├── middleware/       # Bot middleware
│   │   └── error.middleware.ts
│   ├── types/           # TypeScript type definitions
│   │   └── bot.types.ts
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   └── index.ts         # Main bot entry point
├── package.json
├── tsconfig.json
├── context7.json        # Context7 configuration
└── README.md
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   # Navigate to project root and create .env file
   cd ..
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

   **Note:** The .env file should be located in the project root (`Funding/.env`), not in the bot directory.

3. **Required Environment Variables:**
   ```env
   # Required
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   
   # Optional
   BOT_USERNAME=your_bot_username
   NODE_ENV=development
   LOG_LEVEL=info
   RATE_LIMIT_WINDOW=60000
   RATE_LIMIT_MAX_REQUESTS=20
   API_BASE_URL=http://localhost:4000/api
   
   # Admin settings
   ADMIN_IDS=123456789,987654321
   BANNED_USERS=111111111,222222222
   SUPPORT_CHAT_ID=123456789
   
   # Webhook (for production)
   WEBHOOK_URL=https://yourdomain.com/webhook
   WEBHOOK_SECRET=your_webhook_secret
   WEBHOOK_PORT=3000
   ```

4. **Get Bot Token:**
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Create a new bot with `/newbot`
   - Copy the token and add it to your `.env` file

## 🏃‍♂️ Development

### Available Scripts

```bash
npm run dev          # Start in development mode
npm run dev:watch    # Start with file watching and hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production build
npm run clean        # Clean build directory
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Development Workflow

1. **Start development server:**
   ```bash
   npm run dev:watch
   ```

2. **The bot will start in polling mode and automatically restart on file changes**

3. **Test your bot by messaging it on Telegram**

## 🤖 Bot Commands

### Public Commands
- `/start` - Start the bot and show welcome message
- `/help` - Display help information
- `/settings` - Open settings menu
- `/about` - About this bot
- `/cancel` - Cancel current operation

### Admin Commands
- `/stats` - Show bot statistics (admin only)
- `/broadcast <message>` - Broadcast message to all users (admin only)
- `/logs` - Show recent logs (admin only)
- `/debug` - Show debug information (admin only, development mode)

## 🧩 Architecture

### Middleware Stack
1. **Error Handling** - Global error catching and handling
2. **User Validation** - User authentication and ban checking
3. **Rate Limiting** - Spam protection and request throttling
4. **Session Management** - User session initialization and management
5. **Conversations** - Multi-step conversation support
6. **Command Validation** - Command existence and permission checking

### Handler Pattern
- **Command Handlers** - Handle `/command` messages
- **Callback Handlers** - Handle inline keyboard button presses
- **Message Handlers** - Handle different message types (text, photo, etc.)

### Configuration Management
- **Environment-based** - Different settings for development/production
- **Type-safe** - Full TypeScript support for all configurations
- **Centralized** - All settings in one configuration file

## 🔧 Customization

### Adding New Commands

1. **Create handler in `src/handlers/commands.handler.ts`:**
   ```typescript
   export const myCommand: CommandHandler = async (ctx: BotContext) => {
     await ctx.reply('Hello from my custom command!');
   };
   ```

2. **Register in `src/index.ts`:**
   ```typescript
   bot.command('mycommand', myCommand);
   ```

3. **Add to command list in `src/config/bot.config.ts`:**
   ```typescript
   export const botCommands = [
     // ... existing commands
     { command: 'mycommand', description: 'My custom command' },
   ];
   ```

### Adding New Middleware

1. **Create middleware file in `src/middleware/`:**
   ```typescript
   export async function myMiddleware(ctx: BotContext, next: () => Promise<void>) {
     // Pre-processing
     console.log('Before handler');
     
     await next();
     
     // Post-processing
     console.log('After handler');
   }
   ```

2. **Register in `src/index.ts`:**
   ```typescript
   bot.use(myMiddleware);
   ```

### Adding Conversation Flows

1. **Create conversation in appropriate handler:**
   ```typescript
   import { createConversation } from '@grammyjs/conversations';
   
   async function myConversation(conversation: any, ctx: BotContext) {
     await ctx.reply('What is your name?');
     const { message } = await conversation.wait();
     
     await ctx.reply(`Hello, ${message.text}!`);
   }
   
   // Register the conversation
   bot.use(createConversation(myConversation));
   
   // Start the conversation
   await ctx.conversation.enter('myConversation');
   ```

## 🚀 Deployment

### Development
```bash
npm run dev:watch
```

### Production

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Set environment variables for production:**
   ```env
   NODE_ENV=production
   WEBHOOK_URL=https://yourdomain.com/webhook
   WEBHOOK_SECRET=your_webhook_secret
   ```

3. **Start the bot:**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Expose port
EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start dist/index.js --name "telegram-bot"

# Save PM2 configuration
pm2 save

# Setup auto-start on system reboot
pm2 startup
```

## 🔒 Security

### Implemented Security Measures
- **Rate Limiting** - Prevents API abuse and spam
- **User Validation** - Validates all incoming requests
- **Input Sanitization** - HTML escaping for user inputs
- **Environment Variables** - Sensitive data in environment variables
- **Error Masking** - Doesn't expose internal errors to users
- **Admin Authorization** - Proper admin command protection

### Best Practices
- Keep bot token secure and never commit it to version control
- Use HTTPS for webhooks in production
- Implement proper logging for security monitoring
- Regular security updates for dependencies
- Monitor for unusual activity patterns

## 📊 Monitoring and Logging

### Log Levels
- `debug` - Detailed debugging information
- `info` - General operational messages
- `warn` - Warning conditions
- `error` - Error conditions

### What Gets Logged
- User actions and commands
- Bot events and state changes
- Errors and exceptions
- Performance metrics
- Admin activities

### Log Output
- **Development** - Colorized console output
- **Production** - JSON format with file rotation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Bot doesn't respond:**
   - Check if `TELEGRAM_BOT_TOKEN` is set correctly
   - Verify bot is not already running elsewhere
   - Check network connectivity

2. **TypeScript errors:**
   - Run `npm install` to ensure all dependencies are installed
   - Check `tsconfig.json` configuration
   - Verify file paths in imports

3. **Environment variables not loading:**
   - Ensure `.env` file is in the project root directory
   - Check file permissions
   - Verify environment variable names

4. **Rate limiting issues:**
   - Adjust `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX_REQUESTS`
   - Check if user is sending too many requests
   - Review rate limiting logs

### Getting Help

- Check the [Grammy.js documentation](https://grammy.dev/)
- Review bot logs for error details
- Use `/debug` command (admin only) for runtime information
- Create an issue in the repository

## 🙏 Acknowledgments

- [Grammy.js](https://grammy.dev/) - The Telegram Bot framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety and developer experience
- [tsx](https://github.com/esbuild-kit/tsx) - Fast TypeScript execution
- [Winston](https://github.com/winstonjs/winston) - Logging library
- [Context7](https://context7.com/) - AI development assistance 