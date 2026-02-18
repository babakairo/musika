import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; category?: string; search?: string;
    minPrice?: number; maxPrice?: number; featured?: boolean;
  }) {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, featured } = query;
    const skip = (page - 1) * limit;

    const where: any = { active: true };
    if (category) where.category = { slug: category };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (featured !== undefined) where.featured = featured;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where, skip, take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, storeName: true } },
          inventory: { select: { quantityAvailable: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        seller: { select: { id: true, storeName: true, description: true, logo: true } },
        inventory: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(sellerId: string, dto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(dto.name);
    return this.prisma.product.create({
      data: {
        sellerId, categoryId: dto.categoryId, name: dto.name, slug,
        description: dto.description, price: dto.price, comparePrice: dto.comparePrice,
        images: dto.images, featured: dto.featured || false,
        inventory: { create: { sku: dto.sku, quantityAvailable: dto.quantity } },
      },
      include: { inventory: true, category: true },
    });
  }

  async update(productId: string, sellerId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== sellerId) throw new ForbiddenException('You can only update your own products');

    const { quantity, ...productData } = dto;
    const updated = await this.prisma.product.update({ where: { id: productId }, data: productData });
    if (quantity !== undefined) {
      await this.prisma.inventory.update({ where: { productId }, data: { quantityAvailable: quantity } });
    }
    return updated;
  }

  async getSellerProducts(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      include: { inventory: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let slug = base;
    let count = 0;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      count++;
      slug = `${base}-${count}`;
    }
    return slug;
  }
}
