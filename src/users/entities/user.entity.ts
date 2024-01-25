import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  password: string;

  @AfterInsert()
  logInsert() {
    console.log('Inserted');
  }

  @AfterUpdate()
  logUpdate() {
    console.log('logUpdate');
  }

  @AfterRemove()
  logRemove() {
    console.log('logRemove');
  }
}
