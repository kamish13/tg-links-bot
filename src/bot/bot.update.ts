import { Ctx, Update, Command } from 'nestjs-telegraf';
import { LinksService } from '../links/links.service';
import { CreateLinkDto } from '../links/dto/create-link.dto';

@Update()
export class BotUpdate {
  constructor(private readonly linksService: LinksService) {}

  @Command('save')
  async saveLink(@Ctx() ctx: any) {
    const message = ctx.message.text.split(' ');

    if (message.length < 2) {
      return ctx.reply('Please provide a URL to save.');
    }

    const url = message[1];

    try {
      const createLinkDto: CreateLinkDto = {
        url,
        userId: ctx.from.id.toString(),
      };
      const savedLink = await this.linksService.create(createLinkDto);
      ctx.reply(`Link saved! Your unique code is: ${savedLink.code}`);
    } catch {
      ctx.reply('Error: Invalid URL or unable to save the link.');
    }
  }
}
