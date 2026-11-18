import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsInt,
  Min,
  Max,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';

export class CreateCalendarDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsNotEmpty()
  timeZone!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  workingDays!: number[]; // 1 = Monday .. 7 = Sunday

  @IsArray()
  @IsString({ each: true })
  holidays!: string[]; // ["2026-01-01", "2026-12-25"]
}
