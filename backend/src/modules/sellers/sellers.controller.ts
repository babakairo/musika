import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sellers')
export class SellersController {
  constructor(private sellersService: SellersService) {}

  @Post('register')
  register(@CurrentUser('id') userId: string, @Body() dto: RegisterSellerDto) {
    return this.sellersService.register(userId, dto);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.sellersService.getDashboard(userId);
  }
}
