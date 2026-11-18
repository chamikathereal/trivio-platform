import { IsOptional, IsString, Length, IsIn } from 'class-validator';

export class UpdateMerchantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsString()
  @IsOptional()
  acquirerId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status?: string;
}
