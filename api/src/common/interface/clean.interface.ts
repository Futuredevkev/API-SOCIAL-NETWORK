export interface DeletableEntity {
  expiredAt: Date; // o Date | null, si puede ser nulo
  is_active: boolean;
}
