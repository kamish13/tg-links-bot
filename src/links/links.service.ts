import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLinkDto } from './dto/create-link.dto';
import { Link } from './entities/link.entity';
import { LinkFactory } from './factories/link.factory';
import { NotFoundException } from '@nestjs/common';

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

  async deleteByCodeAndUserId(code: string, userId: string): Promise<void> {
    const link = await this.linkRepository.findOne({ where: { code, userId } });

    if (!link) {
      throw new NotFoundException(
        'Link not found or you do not have permission to delete this link.',
      );
    }

    await this.linkRepository.remove(link);
  }
}
