import { getDistance } from 'geolib';
import { Publication } from 'src/publication/entities/publication.entity';

export class UbicationService {
  static isPublicationNearBy(
    publication: Publication,
    userLat: number,
    userLng: number,
  ): boolean {
    const publicationLat = publication.user.address.latitude;
    const publicationLng = publication.user.address.longitude;

    const distance = getDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: publicationLat, longitude: publicationLng },
    );

    return distance <= 50000;
  }
}
