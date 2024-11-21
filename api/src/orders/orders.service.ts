import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { StatusPay } from 'src/enums/enum-status-pay';
import { PaginationService } from 'src/common/pagination.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginationService: PaginationService,
  ) {}

  async createOrder(userId: string, orderDto: CreateOrderDto): Promise<Order> {
    const userAuth = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!userAuth) {
      throw new NotFoundException('User not found');
    }

    const order = this.ordersRepository.create({
      ...orderDto,
      user: userAuth,
    });

    return await this.ordersRepository.save(order);
  }

  async getOrdersByUser(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: Order[];
    meta: { lastpage: number; offset: number; totalItems: number };
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { data, meta } = await this.paginationService.paginate(
      this.ordersRepository,
      paginationDto,
      {
        where: { user: { id: userId } },
        relations: ['user'],
      },
    );

    return { data, meta };
  }

  async getOrderStatus(userId: string): Promise<StatusPay> {
    const order = await this.ordersRepository.findOne({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });

    if (!order) {
      throw new NotFoundException(`No orders found for user with ID ${userId}`);
    }

    return order.status;
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateOrderPaymentId(
    orderId: string,
    paymentId: string,
  ): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.paymentId = paymentId;
    await this.ordersRepository.save(order);
  }

  async updateOrderStatus(orderId: string, status: StatusPay): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    console.log(
      `Updating order ${orderId} status from ${order.status} to ${status}`,
    );
    order.status = status;
    await this.ordersRepository.save(order);
  }
}
