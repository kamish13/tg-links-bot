import { Repository } from 'typeorm';
import { Link } from '../links/entities/link.entity';

export async function generateUniqueCode(
  linkRepository: Repository<Link>,
): Promise<string> {
  let code: string;
  let linkWithCode: Link | null;

  do {
    code = Math.random().toString(36).substring(2, 8);

    linkWithCode = await linkRepository.findOne({ where: { code } });
  } while (linkWithCode);

  return code;
}
