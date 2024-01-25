import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async singup({ email, password }: { email: string; password: string }) {
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });
  }
  async singin({ email, password }: { email: string; password: string }) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User fot found');
    }

    const [storedSalt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, storedSalt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Bad Creds');
    }

    return user;
  }
}
