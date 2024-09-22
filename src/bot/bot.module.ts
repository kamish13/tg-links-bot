import { Module } from '@nestjs/common';
import { LinksModule } from '../links/links.module';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [LinksModule],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
