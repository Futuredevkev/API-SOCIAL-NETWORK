import {
  Injectable,
  InternalServerErrorException,
  type PipeTransform,
} from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ParseFileSharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Buffer>>
{
  async transform(image: Express.Multer.File): Promise<Buffer> {
    if (image) {
      return await sharp(image.buffer).resize(720).webp().toBuffer();
    }

    throw new InternalServerErrorException(
      'Error uploading file | Check logs server',
    );
  }
}
