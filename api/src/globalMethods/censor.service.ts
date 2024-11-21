import { penalizedWordsComments } from 'src/enums/enum.penalizes.comments';

export class CensorService {
  static censorProfanity(text?: string): string {
    const censorText = (text: string | undefined): string => {
      if (!text) return text || '';
      return penalizedWordsComments.reduce((censored, word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        return censored.replace(regex, '*'.repeat(word.length));
      }, text);
    };

    return censorText(text);
  }
}
