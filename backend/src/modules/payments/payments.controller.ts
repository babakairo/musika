import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, WebhookDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('ecocash/initiate')
  @Roles(Role.CUSTOMER)
  initiate(@CurrentUser('id') customerId: string, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiateEcoCash(customerId, dto);
  }

  @Public()
  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.paymentsService.getStatus(id);
  }

  @Public()
  @Post('webhook/ecocash')
  webhook(@Body() dto: WebhookDto) {
    return this.paymentsService.handleWebhook(dto);
  }

  /**
   * Demo endpoint: simulate EcoCash payment approval (dev/staging only)
   */
  @Post(':id/simulate')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  simulate(@Param('id') id: string, @Query('success') success?: string) {
    return this.paymentsService.simulateWebhook(id, success !== 'false');
  }
}
