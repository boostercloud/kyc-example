import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Profile } from '../profile/profile.entity';

@Entity()
export class Relative {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  relation: string;

  @Column()
  politicalInfluence?: boolean;

  @ManyToOne(() => Profile, (profile) => profile.relatives, {
    onDelete: 'CASCADE',
  })
  profile: Profile;
}
