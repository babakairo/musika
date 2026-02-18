import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.seller.count({ where: { approved: true } }),
      this.prisma.seller.count({ where: { approved: false } }),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.order.count(),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          payment: { select: { status: true, amount: true } },
        },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    return {
      users: { total: totalUsers },
      sellers: { total: totalSellers, pending: pendingSellers },
      products: { total: totalProducts },
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {}),
      },
      revenue: {
        total: revenueResult._sum.amount ?? 0,
        currency: 'USD',
      },
      recentOrders,
    };
  }

  async getPendingSellers() {
    return this.prisma.seller.findMany({
      where: { approved: false },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveSeller(sellerId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');
    return this.prisma.seller.update({
      where: { id: sellerId },
      data: { approved: true },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async rejectSeller(sellerId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');
    // In production: notify user, allow re-application
    return this.prisma.seller.delete({ where: { id: sellerId } });
  }

  async getAllUsers(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, phone: true, createdAt: true,
          seller: { select: { id: true, storeName: true, approved: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAllOrders(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;
    const where: any = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: { select: { quantity: true, subtotal: true, product: { select: { name: true } } } },
          payment: { select: { status: true, method: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({ where: { id: orderId }, data: { status: status as OrderStatus } });
  }
}
