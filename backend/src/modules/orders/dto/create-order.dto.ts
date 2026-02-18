import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '@prisma/client';

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsUUID()
  agentLocationId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;
}
