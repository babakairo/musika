import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiatePaymentDto, WebhookDto } from './dto/initiate-payment.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiateEcoCash(customerId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new BadRequestException('Access denied');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order is not in PENDING status');
    if (order.payment) throw new BadRequestException('Payment already initiated for this order');

    const reference = `ECOCASH-${uuidv4().substring(0, 8).toUpperCase()}`;

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        method: dto.method,
        amount: Number(order.totalAmount),
        phone: dto.phoneNumber,
        reference,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentId: payment.id,
      reference,
      amount: Number(order.totalAmount),
      phoneNumber: dto.phoneNumber,
      status: PaymentStatus.PENDING,
      message: `EcoCash payment request sent to ${dto.phoneNumber}. Approve on your phone.`,
      pollUrl: `/api/v1/payments/${payment.id}/status`,
    };
  }

  async getStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: { select: { id: true, status: true, totalAmount: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async handleWebhook(dto: WebhookDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.PENDING) return { message: 'Payment already processed' };

    if (dto.status === 'SUCCESS') {
      return this.prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.SUCCESS, paidAt: new Date() } });
        const order = await tx.order.update({ where: { id: payment.orderId }, data: { status: OrderStatus.PAID } });
        const items = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });
        for (const item of items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantityReserved: { decrement: item.quantity }, quantitySold: { increment: item.quantity } },
          });
        }
        return { message: 'Payment confirmed', orderId: order.id, status: OrderStatus.PAID };
      });
    } else {
      return this.prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED } });
        await tx.order.update({ where: { id: payment.orderId }, data: { status: OrderStatus.CANCELLED } });
        const items = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });
        for (const item of items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantityAvailable: { increment: item.quantity }, quantityReserved: { decrement: item.quantity } },
          });
        }
        return { message: 'Payment failed, order cancelled' };
      });
    }
  }

  async simulateWebhook(paymentId: string, success = true) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.handleWebhook({ paymentId, reference: payment.reference ?? '', status: success ? 'SUCCESS' : 'FAILED' });
  }
}
