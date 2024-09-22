import { Injectable } from '@nestjs/common';
import { Link } from '../entities/link.entity';
import { CreateLinkDto } from '../dto/create-link.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateUniqueCode } from '../../utils/code-generator';

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
    link.code = await generateUniqueCode(this.linkRepository);
    link.userId = userId;

    return link;
  }
}
