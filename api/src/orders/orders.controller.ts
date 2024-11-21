import { Controller, Get, Body, Patch, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { StatusPay } from 'src/enums/enum-status-pay';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { Roles } from 'src/enums/enum.roles';

@Auth(Roles.ADMIN, Roles.USER)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get('find/ordersMe')
  getOrdersByUser(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.ordersService.getOrdersByUser(userId, paginationDto);
  }

  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('find/getOrderStatusAuth')
  getOrderStatus(@GetUser('id') userId: string) {
    return this.ordersService.getOrderStatus(userId);
  }

  @Patch(':orderId/:paymentId')
  updateOrderPaymentId(
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.ordersService.updateOrderPaymentId(orderId, paymentId);
  }

  @Patch(':id')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: StatusPay,
  ) {
    return this.ordersService.updateOrderStatus(orderId, status);
  }
}
