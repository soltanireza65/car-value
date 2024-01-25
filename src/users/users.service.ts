import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    const user = this.repo.create(createUserDto);

    return this.repo.save(user);
  }

   findOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }
  find(email: string) {
    return this.repo.find({
      where: {
        email,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      // TODO: move to controller
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      // TODO: move to controller
      throw new NotFoundException('User not found');
    }

    return this.repo.remove(user);
  }
}
