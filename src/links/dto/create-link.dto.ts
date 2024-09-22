import { IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({}, { message: 'The provided value must be a valid URL' })
  url: string;
}
