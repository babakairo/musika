import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: RegisterSellerDto) {
    const existing = await this.prisma.seller.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('You already have a seller account');

    return this.prisma.seller.create({
      data: { userId, ...dto },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  async getDashboard(userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
      include: { products: { include: { inventory: true, category: true } } },
    });
    if (!seller) throw new NotFoundException('Seller account not found');

    const orderItems = await this.prisma.orderItem.findMany({
      where: { product: { sellerId: seller.id } },
      include: { order: { select: { status: true, createdAt: true } } },
    });

    const totalRevenue = orderItems
      .filter((item) => ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(item.order.status))
      .reduce((sum, item) => sum + Number(item.subtotal), 0);

    const totalOrders = new Set(orderItems.map((item) => item.orderId)).size;
    const totalProducts = seller.products.length;
    const lowStockProducts = seller.products.filter(
      (p) => p.inventory && p.inventory.quantityAvailable <= p.inventory.lowStockThreshold,
    );

    return {
      seller,
      stats: { totalRevenue, totalOrders, totalProducts, lowStockCount: lowStockProducts.length },
      lowStockProducts,
    };
  }

  async findAll() {
    return this.prisma.seller.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(sellerId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) throw new NotFoundException('Seller not found');

    await this.prisma.user.update({ where: { id: seller.userId }, data: { role: 'SELLER' } });
    return this.prisma.seller.update({ where: { id: sellerId }, data: { approved: true } });
  }
}
