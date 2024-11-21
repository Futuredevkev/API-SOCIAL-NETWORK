import { CloudinaryResponse } from "../cloudinary-response";


export interface UploadStrategy {
  upload(file: Buffer): Promise<CloudinaryResponse>;
}
