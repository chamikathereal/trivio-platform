import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  Length,
} from 'class-validator';

export class CalculateEstimateDto {
  @IsNotEmpty()
  grossMinor!: string | number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency!: string;

  @IsDateString()
  @IsNotEmpty()
  transactionTime!: string;

  @IsString()
  @IsNotEmpty()
  acquirerId!: string;

  @IsString()
  @IsOptional()
  merchantId?: string;

  @IsBoolean()
  @IsOptional()
  persist?: boolean;
}
