import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalVerificationService {
  private readonly apiKey = 'YOUR_ID_ANALYZER_API_KEY'; 
  private readonly apiUrl = 'https://api.idanalyzer.com';

  async verify(data: { userId: string; documentUrls: string[] }) {
    try {
      const response = await axios.post(`${this.apiUrl}/v2/documents`, {
        apiKey: this.apiKey,
        file_front: data.documentUrls[0], 
        file_back: data.documentUrls[1], 
        country: '', 
        biometric: false, 
      });

      if (response.data.error) {
        throw new Error(`Verification failed: ${response.data.error.message}`);
      }

      
      return {
        status: response.data.result === 'Approved' ? 'approved' : 'rejected',
        details: response.data,
      };
    } catch (error) {
      throw new Error(`External verification failed: ${error.message}`);
    }
  }
}
