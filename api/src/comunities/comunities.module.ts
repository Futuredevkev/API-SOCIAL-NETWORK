import { Module } from '@nestjs/common';
import { ComunitiesController } from './comunities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/comunity.entity';
import { User } from 'src/user/entities/user.entity';
import { UserCommunity } from './entities/user.community.entity';
import { PaginationService } from 'src/common/pagination.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PostImageUploadStrategy } from 'src/cloudinary/strategy/post-image-strategy';
import { UserImageUploadStrategy } from 'src/cloudinary/strategy/user-image-strategy';
import { CommentImageUploadStrategy } from 'src/cloudinary/strategy/comment-image-strategy';
import { ResponsesImageUploadStrategy } from 'src/cloudinary/strategy/responses-image-strategy';
import { GroupExpandImageUploadStrategy } from 'src/cloudinary/strategy/group-expand-image-strategy';
import { EventImageUploadStrategy } from 'src/cloudinary/strategy/event-image-strategy';
import { PaymentsService } from 'src/payments/payments.service';
import { OrdersService } from 'src/orders/orders.service';
import { OrdersModule } from 'src/orders/orders.module';
import { PaypalService } from 'src/paypal/paypal.service';
import { MercadoPagoService } from 'src/mercadopago/mercadopago.service';
import { Order } from 'src/orders/entities/order.entity';
import { PaypalProvider } from 'src/paypal/paypal.provider';
import { MercadopagoProvider } from 'src/mercadopago/mercadopago.provider';
import { ComunitiesService } from './comunities.service';
import { MessageVideoUploadStrategy } from 'src/cloudinary/strategy/message-videoUpload-strategy';
import { MessageImageUploadStrategy } from 'src/cloudinary/strategy/message-image-strategy copy';
import { MessageAudioUploadStrategy } from 'src/cloudinary/strategy/message-audioUpload-strategy';
import { IAImageStrategy } from 'src/cloudinary/strategy/ia-image-strategy';
import { VerificationUserStrategy } from 'src/cloudinary/strategy/verification-user-strategy';
import { StreamImagePreviewStrategy } from 'src/cloudinary/strategy/stream-image-preview-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, User, UserCommunity, Order]),
    OrdersModule,
  ],
  controllers: [ComunitiesController],
  providers: [
    PaginationService,
    CloudinaryService,
    PostImageUploadStrategy,
    UserImageUploadStrategy,
    CommentImageUploadStrategy,
    ResponsesImageUploadStrategy,
    GroupExpandImageUploadStrategy,
    EventImageUploadStrategy,
    MessageVideoUploadStrategy,
    MessageImageUploadStrategy,
    PaymentsService,
    OrdersService,
    PaypalService,
    MercadoPagoService,
    PaypalProvider,
    MercadopagoProvider,
    ComunitiesService,
    MessageAudioUploadStrategy,
    IAImageStrategy,
    VerificationUserStrategy,
    StreamImagePreviewStrategy,
  ],
})
export class ComunitiesModule {}
