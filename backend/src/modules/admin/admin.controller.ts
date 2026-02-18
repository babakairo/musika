import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllUsers({ page: Number(page) || 1, limit: Number(limit) || 20 });
  }

  @Get('sellers/pending')
  getPendingSellers() {
    return this.adminService.getPendingSellers();
  }

  @Post('sellers/:id/approve')
  approveSeller(@Param('id') id: string) {
    return this.adminService.approveSeller(id);
  }

  @Delete('sellers/:id/reject')
  rejectSeller(@Param('id') id: string) {
    return this.adminService.rejectSeller(id);
  }

  @Get('orders')
  getOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllOrders({ page: Number(page) || 1, limit: Number(limit) || 20, status });
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateOrderStatus(id, body.status);
  }
}
