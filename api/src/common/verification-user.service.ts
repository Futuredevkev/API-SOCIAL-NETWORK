import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalVerificationService {
  private readonly apiKey = 'eNEeYEV6GEILUory8G44jmr2uwCGnuFr';
  private readonly apiUrl = 'https://api2.idanalyzer.com';

  async verify(data: {
    userId: string;
    documentUrls: string[];
    faceFileUrl: string;
  }) {
    try {
      console.log('Sending request to API:', {
        apiKey: this.apiKey,
        file_front: data.documentUrls[0],
        file_back: data.documentUrls[1],
        selfie: data.faceFileUrl,
      });

      const response = await axios.post(`${this.apiUrl}/v2/documents`, {
        apiKey: this.apiKey,
        file_front: data.documentUrls[0],
        file_back: data.documentUrls[1],
        selfie: data.faceFileUrl,
        country: '',
        biometric: true,
      });

      console.log('API Response:', response.data);

      if (response.data.error) {
        throw new Error(`Verification failed: ${response.data.error.message}`);
      }

      return {
        status: response.data.result === 'Approved' ? 'approved' : 'rejected',
        details: response.data,
      };
    } catch (error) {
      console.error('API Request failed:', error.message);
      throw new Error(`External verification failed: ${error.message}`);
    }
  }
}
