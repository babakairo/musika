import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  comparePrice?: number;

  @IsString()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsString()
  @MinLength(3)
  sku: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;
}
