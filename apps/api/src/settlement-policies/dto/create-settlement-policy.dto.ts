import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateSettlementPolicyDto {
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
  @Max(30)
  cycleDays!: number; // T+N

  @IsString()
  @IsOptional()
  cycleUnit?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Cut-off time must be in HH:mm 24-hour UTC format (e.g. 16:00).',
  })
  cutOffTimeUtc!: string;

  @IsString()
  @IsNotEmpty()
  timeZone!: string;

  @IsString()
  @IsOptional()
  calendarId?: string;

  @IsString()
  @IsIn(['following_business_day', 'preceding_business_day', 'no_adjustment'])
  weekendHandling!: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  priority?: number;
}
