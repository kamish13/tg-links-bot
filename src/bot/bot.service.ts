import { Injectable } from '@nestjs/common';
import { LinksService } from '../links/links.service';
import { CreateLinkDto } from '../links/dto/create-link.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Markup } from 'telegraf';

@Injectable()
export class BotService {
  constructor(private readonly linksService: LinksService) {}

  public sendWelcomeMessage(ctx: any): void {
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

  public async saveLink(ctx: any): Promise<void> {
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
    } catch (error) {
      if (error.message === 'You have already saved this link.') {
        ctx.reply('You have already saved this link.');
      } else {
        ctx.reply('Error: Unable to save the link.');
      }
    }
  }

  public async listLinks(ctx: any): Promise<void> {
    const userId = ctx.message.from.id.toString();
    const page = 1;
    const perPage = 5;

    await this.sendLinksPage(ctx, userId, page, perPage);
  }

  public async sendLinksPage(
    ctx: any,
    userId: string,
    page: number,
    perPage: number,
  ): Promise<void> {
    try {
      const { links, totalPages, currentPage } =
        await this.linksService.findAllByUserId(userId, page, perPage);

      if (links.length === 0) {
        return ctx.reply('You have no saved links.');
      }

      const response = links
        .map(
          (link, index) =>
            `${(currentPage - 1) * perPage + index + 1}. ${link.code}: ${link.url}`,
        )
        .join('\n');

      const keyboard = Markup.inlineKeyboard([
        ...(currentPage > 1
          ? [Markup.button.callback('⬅️ Previous', `list_${currentPage - 1}`)]
          : []),
        ...(currentPage < totalPages
          ? [Markup.button.callback('Next ➡️', `list_${currentPage + 1}`)]
          : []),
      ]);

      await ctx.reply(
        `Your links (Page ${currentPage}/${totalPages}):\n\n${response}`,
        keyboard,
      );
    } catch (error) {
      console.error('Error retrieving links:', error);
      ctx.reply('Error: Unable to retrieve the list of links.');
    }
  }

  public async getLink(ctx: any): Promise<void> {
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

  public async deleteLink(ctx: any): Promise<void> {
    const message = ctx.message.text.split(' ');

    if (message.length < 2) {
      return ctx.reply(
        'Please provide the unique code of the link you want to delete.',
      );
    }

    const code = message[1];
    const userId = ctx.message.from.id;

    try {
      await this.linksService.deleteByCodeAndUserId(code, userId);
      ctx.reply('Link deleted successfully.');
    } catch (error) {
      ctx.reply(error.message || 'Error: Unable to delete the link.');
    }
  }
}
