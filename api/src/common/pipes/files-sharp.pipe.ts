import {
  Injectable,
  InternalServerErrorException,
  type PipeTransform,
} from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ParseFilesSharpPipe
  implements PipeTransform<Express.Multer.File[], Promise<Buffer[]>>
{
  async transform(images: Express.Multer.File[]): Promise<Buffer[]> {
    if (images) {
      const filesBuffers = await Promise.all(
        images.map(async (img) => {
          return await sharp(img.buffer).resize(720).webp().toBuffer();
        }),
      );

      return filesBuffers;
    }

    throw new InternalServerErrorException(
      'Error uploading file | Check logs server',
    );
  }
}
