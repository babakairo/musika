import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Role } from '@prisma/client';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:   [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID:      [OrderStatus.PACKED, OrderStatus.CANCELLED],
  PACKED:    [OrderStatus.SHIPPED],
  SHIPPED:   [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { inventory: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found or inactive');
    }

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product?.inventory) throw new BadRequestException(`Product has no inventory`);
      if (product.inventory.quantityAvailable < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${product.name}"`);
      }
    }

    const deliveryFee = dto.deliveryType === 'HOME_DELIVERY' ? 5 : 0;
    const subtotal = dto.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);
    const totalAmount = subtotal + deliveryFee;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId,
          status: OrderStatus.PENDING,
          deliveryType: dto.deliveryType,
          deliveryAddress: dto.deliveryAddress,
          agentLocationId: dto.agentLocationId,
          notes: dto.notes,
          totalAmount,
          items: {
            create: dto.items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              const unitPrice = Number(product.price);
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                subtotal: unitPrice * item.quantity,
              };
            }),
          },
        },
        include: {
          items: { include: { product: { select: { name: true, images: true } } } },
          agentLocation: true,
        },
      });

      for (const item of dto.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantityAvailable: { decrement: item.quantity },
            quantityReserved: { increment: item.quantity },
          },
        });
      }

      return order;
    });
  }

  async findById(orderId: string, userId: string, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true, slug: true } } } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        agentLocation: true,
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (userRole === Role.CUSTOMER && order.customerId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  async findMyOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        payment: { select: { status: true, method: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: string, userId: string, userRole: Role, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const newStatus = status as OrderStatus;
    const validNext = VALID_TRANSITIONS[order.status];
    if (!validNext.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}.`);
    }

    if (userRole === Role.CUSTOMER) {
      if (order.customerId !== userId) throw new ForbiddenException('Access denied');
      if (newStatus !== OrderStatus.CANCELLED) throw new ForbiddenException('Customers can only cancel orders');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });

      if (newStatus === OrderStatus.PAID) {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantityReserved: { decrement: item.quantity }, quantitySold: { increment: item.quantity } },
          });
        }
      }
      if (newStatus === OrderStatus.CANCELLED) {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantityAvailable: { increment: item.quantity }, quantityReserved: { decrement: item.quantity } },
          });
        }
      }
      return updated;
    });
  }

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;
    const where: any = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: { select: { quantity: true, subtotal: true } },
          payment: { select: { status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
