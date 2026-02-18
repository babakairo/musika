import { IsUUID, IsString, IsPhoneNumber, IsEnum, IsOptional } from 'class-validator';

export enum PaymentMethod {
  ECOCASH = 'ECOCASH',
}

export class InitiatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  phoneNumber: string;
}

export class WebhookDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  reference: string;

  @IsString()
  status: 'SUCCESS' | 'FAILED';
}
