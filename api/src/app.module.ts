import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeOrmConfig from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailsModule } from './mail/mail.module';
import { PublicationModule } from './publication/publication.module';
import { CommentsModule } from './comments/comments.module';
import { StarsModule } from './stars/stars.module';
import { LikeModule } from './like/like.module';
import { ResponsesModule } from './responses/responses.module';
import { ComunitiesModule } from './comunities/comunities.module';
import { EventsModule } from './events/events.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { WsChatModule } from './ws-chat/ws-chat.module';
import { GroupChatModule } from './group-chat/group-chat.module';
import { CleanUpModule } from './cleanup_chats/cleanup.module';
import { deEventsModule } from './events_desactivated/de-events.module';
import { NotificationsModule } from './notifications/notifications.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    AuthModule,
    UserModule,
    MailsModule,
    PublicationModule,
    CommentsModule,
    StarsModule,
    LikeModule,
    ResponsesModule,
    ComunitiesModule,
    EventsModule,
    PaymentsModule,
    OrdersModule,
    ChatModule,
    WsChatModule,
    GroupChatModule,
    CleanUpModule,
    deEventsModule,
    NotificationsModule,
  ],
  controllers: [],
})
export class AppModule {}
