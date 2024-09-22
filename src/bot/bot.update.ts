import { Ctx, Update, Command, Action } from 'nestjs-telegraf';
import { LinksService } from '../links/links.service';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(
    private readonly linksService: LinksService,
    private readonly botService: BotService,
  ) {}

  @Command('start')
  async onStart(@Ctx() ctx: any) {
    this.botService.sendWelcomeMessage(ctx);
  }

  @Command('save')
  async saveLink(@Ctx() ctx: any) {
    await this.botService.saveLink(ctx);
  }

  @Command('list')
  async listLinks(@Ctx() ctx: any) {
    await this.botService.listLinks(ctx);
  }

  @Command('get')
  async getLink(@Ctx() ctx: any) {
    await this.botService.getLink(ctx);
  }

  @Command('delete')
  async deleteLink(@Ctx() ctx: any) {
    await this.botService.deleteLink(ctx);
  }

  // Handle pagination callback
  @Action(/^list_(\d+)$/)
  async handlePaginationCallback(@Ctx() ctx: any) {
    const page = parseInt(ctx.match[1]);
    const userId = ctx.from.id.toString();
    const perPage = 5;

    await ctx.answerCbQuery();
    await this.botService.sendLinksPage(ctx, userId, page, perPage);
  }
}
