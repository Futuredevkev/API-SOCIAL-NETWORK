import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableShutdownHooks();
  app.enableCors();
  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API ECO')
    .setDescription('SOCIAL NETWORK ECO')
    .setVersion('1.0')
    .addTag('user')
    .addTag('auth')
    .addTag('chat')
    .addTag('comments')
    .addTag('comunities')
    .addTag('events')
    .addTag('group-chat')
    .addTag('like')
    .addTag('orders')
    .addTag('payments')
    .addTag('publication')
    .addTag('responses')
    .addTag('stars')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/swagger', app, document);

  await app.listen(3000);
}
bootstrap();
