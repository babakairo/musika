import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards, ParseFloatPipe, ParseBoolPipe, Optional,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('featured') featured?: string,
  ) {
    return this.productsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      category,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Get('seller')
  @Roles(Role.SELLER)
  getMyProducts(@CurrentUser('id') sellerId: string) {
    return this.productsService.getSellerProducts(sellerId);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @Roles(Role.SELLER)
  create(@CurrentUser('id') sellerId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(sellerId, dto);
  }

  @Put(':id')
  @Roles(Role.SELLER)
  update(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, sellerId, dto);
  }
}
