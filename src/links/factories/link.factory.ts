import { Injectable } from '@nestjs/common';
import { Link } from '../entities/link.entity';
import { CreateLinkDto } from '../dto/create-link.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LinkFactory {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}
  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    const { url, userId } = createLinkDto;

    const link = new Link();
    link.url = url;
    link.code = await this.generateUniqueCode();
    link.userId = userId;

    return link;
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let linkWithCode: Link | null;

    do {
      code = Math.random().toString(36).substring(2, 8);

      linkWithCode = await this.linkRepository.findOne({ where: { code } });
    } while (linkWithCode);
    return code;
  }
}
