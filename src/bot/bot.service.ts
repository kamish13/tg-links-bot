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

    // Handle /list command
    this.bot.command('list', (ctx) => this.listLinks(ctx));

    // Handle /delete command
    this.bot.command('delete', (ctx) => this.deleteLink(ctx));

    // Handle /get command
    this.bot.command('get', (ctx) => this.getLink(ctx));
  }

  private async getLink(ctx: any): Promise<void> {
    const message = ctx.message.text.split(' ');

    if (message.length < 2) {
      return ctx.reply(
        'Please provide the unique code of the link you want to retrieve.',
      );
    }

    const code = message[1];

    try {
      const link = await this.linksService.findByCode(code);
      ctx.reply(`Here is the link: ${link.url}`);
    } catch (error) {
      ctx.reply(error.message || 'Error: Unable to retrieve the link.');
    }
  }

  private sendWelcomeMessage(ctx: any): void {
    const welcomeMessage = `
    Welcome to the Link Saver Bot! 🚀

    Here’s what you can do:
    - Use /save <url> to save a link.
    - Use /list to see all your saved links.
    - Use /get <code> to retrieve a link by its unique code.
    - Use /delete <code> to delete a link by its unique code.

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
    const userId = ctx.message.from.id;

    const createLinkDto = plainToInstance(CreateLinkDto, { url, userId });

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

  private async listLinks(ctx: any): Promise<void> {
    const userId = ctx.message.from.id;

    try {
      const links = await this.linksService.findAllByUserId(userId);

      if (links.length === 0) {
        return ctx.reply('You have no saved links.');
      }

      const response = links
        .map((link) => `${link.code}: ${link.url}`)
        .join('\n');
      ctx.reply(response);
    } catch {
      ctx.reply('Error: Unable to retrieve the list of links.');
    }
  }

  private async deleteLink(ctx: any): Promise<void> {
    const message = ctx.message.text.split(' ');

    if (message.length < 2) {
      return ctx.reply(
        'Please provide the unique code of the link you want to delete.',
      );
    }

    const code = message[1];
    const userId = ctx.message.from.id; // Get user ID from the Telegram context

    try {
      await this.linksService.deleteByCodeAndUserId(code, userId);
      ctx.reply('Link deleted successfully.');
    } catch (error) {
      ctx.reply(error.message || 'Error: Unable to delete the link.');
    }
  }
}
