import { BaseEntityID } from "src/utils/base-entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class FavUser extends BaseEntityID {
    @ManyToOne(() => User, (user) => user.favoritesInitiated, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => User, (user) => user.favoritesReceived, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'favorite_user_id' })
    favoriteUser!: User;
    
}