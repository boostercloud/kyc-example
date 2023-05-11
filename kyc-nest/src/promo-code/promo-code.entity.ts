import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from '../profile/profile.entity';

@Entity()
export class PromoCode {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  code: string;

  @ManyToOne(() => Profile, (profile) => profile.relatives, {
    onDelete: 'CASCADE',
  })
  profile: Profile;
}
