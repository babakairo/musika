import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterSellerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  storeName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
