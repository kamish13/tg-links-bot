import { IsUrl } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  url: string;
}
