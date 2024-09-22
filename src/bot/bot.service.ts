import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { LinksService } from '../links/links.service';
import { CreateLinkDto } from '../links/dto/create-link.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly linksService: LinksService,
  ) {
    this.setupBot();
  }

  private setupBot(): void {
    // Handle /start command
    this.bot.start((ctx) => this.sendWelcomeMessage(ctx));

    // Handle /save command
    this.bot.command('save', (ctx) => this.saveLink(ctx));
  }

  private sendWelcomeMessage(ctx: any): void {
    const welcomeMessage = `
    Welcome to the Link Saver Bot! 🚀

    Here’s what you can do:
    - Use /save <url> to save a link.
    - Use /list to see all your saved links.
    - Use /get <code> to retrieve a link by its unique code.

    Happy saving! 😊
    `;
    ctx.reply(welcomeMessage);
  }

  private async saveLink(ctx: any): Promise<void> {
    const message = ctx.message.text.split(' ');

    if (message.length < 2) {
      return ctx.reply('Please provide a URL to save.');
    }

    const url = message[1];

    const createLinkDto = plainToInstance(CreateLinkDto, { url });
    const errors = await validate(createLinkDto);
    if (errors.length > 0) {
      return ctx.reply('The provided value must be a valid URL.');
    }
    try {
      const savedLink = await this.linksService.create(createLinkDto);
      ctx.reply(`Link saved! Your unique code is: ${savedLink.code}`);
    } catch {
      ctx.reply('Error: Invalid URL or unable to save the link.');
    }
  }
}
