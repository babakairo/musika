import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.CUSTOMER)
  create(@CurrentUser('id') customerId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(customerId, dto);
  }

  @Get('my')
  getMyOrders(@CurrentUser('id') customerId: string) {
    return this.ordersService.findMyOrders(customerId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SELLER)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll({ page: Number(page) || 1, limit: Number(limit) || 20, status });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.ordersService.findById(id, userId, role);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, userId, role, dto.status);
  }
}
