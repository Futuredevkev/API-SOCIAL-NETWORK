import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      console.log(user + ' ' + data);
      throw new BadRequestException('User not found');
    } else
      (error) => {
        console.log(error);
      };

    return !data ? user : user[data];
  },
);
