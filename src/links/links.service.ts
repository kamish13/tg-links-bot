import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import { Link } from './entities/link.entity';
import { LinkFactory } from './factories/link.factory';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
    private linkFactory: LinkFactory,
  ) {}

  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    const link = await this.linkFactory.create(createLinkDto);
    return this.linkRepository.save(link);
  }

  async findAllByUserId(userId: string): Promise<Link[]> {
    return this.linkRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
