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
export class MessageAudioUploadStrategy implements UploadStrategy {
  async upload(file: Buffer): Promise<CloudinaryResponse> {
    if (!file) {
      throw new NotFoundException('Audio not found');
    }

    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto', 
            folder: 'audio-folder', 
            public_id: uuid(),
          },
          (error, result) => {
            if (error) {
              reject(error);
              throw new BadRequestException('Error uploading audio');
            } else {
              if (result) {
                resolve(result);
              } else {
                throw new InternalServerErrorException(
                  'Error uploading audio | Check logs server',
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
        'Error uploading audio | Check logs server',
      );
    }
  }
}
