import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_-]+$/i, {
    message: 'Merchant code must be alphanumeric and may contain hyphens or underscores.',
  })
  code!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency!: string;

  @IsString()
  @IsNotEmpty()
  acquirerId!: string;
}
