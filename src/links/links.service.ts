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
    const existingLink = await this.findByUrlAndUserId(
      createLinkDto.url,
      createLinkDto.userId,
    );
    if (existingLink) {
      throw new Error('You have already saved this link.');
    }
    const link = await this.linkFactory.create(createLinkDto);
    return this.linkRepository.save(link);
  }

  async findByUrlAndUserId(url: string, userId: string): Promise<Link | null> {
    return this.linkRepository.findOne({ where: { url, userId } });
  }

  async findAllByUserId(
    userId: string,
    page: number = 1,
    perPage: number = 5,
  ): Promise<{ links: Link[]; totalPages: number; currentPage: number }> {
    const [links, total] = await this.linkRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: perPage,
      skip: (page - 1) * perPage,
    });

    const totalPages = Math.ceil(total / perPage);

    return {
      links,
      totalPages,
      currentPage: page,
    };
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

  async findByCode(code: string): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { code } });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    return link;
  }
}
