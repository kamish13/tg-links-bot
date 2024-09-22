import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import { Link } from './entities/link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
  ) {}

  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    const { url } = createLinkDto;

    const link = new Link();
    link.url = url;
    link.code = await this.generateUniqueCode();

    return this.linkRepository.save(link);
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
