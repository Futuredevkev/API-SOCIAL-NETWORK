import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';
import { UploadStrategy } from '../interface/upload-strategy';
import { CloudinaryResponse } from '../cloudinary-response';

@Injectable()
export class PostImageUploadStrategy implements UploadStrategy {
  async upload(file: Buffer): Promise<CloudinaryResponse> {
    if (!file) {
      throw new NotFoundException('Image not found');
    }

    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'post-image',
            public_id: uuid(),
          },
          (error, result) => {
            if (error) {
              reject(error);
              throw new BadRequestException('error uploading file');
            } else {
              if (result) {
                resolve(result);
              } else {
                throw new InternalServerErrorException(
                  'Error uploading file | Check logs server',
                );
              }
            }
          },
        );
        Readable.from(Buffer.from(file)).pipe(uploadStream);
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error uploading file | Check logs server',
      );
    }
  }
}
