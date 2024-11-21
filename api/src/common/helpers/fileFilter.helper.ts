import { Request } from 'express';

export const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: any,
) => {
  if (!file) return cb(new Error('File is empaty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['png', 'jpg', 'svg', 'webp', 'jpeg'];

  if (validExtensions.includes(fileExtension)) {
    return cb(null, true);
  }

  cb(null, false);
};
