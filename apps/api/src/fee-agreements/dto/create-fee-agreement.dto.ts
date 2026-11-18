import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateFeeAgreementDto {
  @IsString()
  @IsOptional()
  merchantId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsNotEmpty()
  acquirerId!: string;

  @IsInt()
  @Min(0)
  @Max(10000) // 100% max MDR
  percentageBps!: number;

  @IsNotEmpty()
  fixedFeeMinor!: string | number; // String minor units or numeric minor units

  @IsOptional()
  minFeeMinor?: string | number;

  @IsOptional()
  maxFeeMinor?: string | number;

  @IsInt()
  @IsOptional()
  @Min(0)
  priority?: number;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;
}
