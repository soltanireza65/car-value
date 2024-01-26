import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let users: User[] = [];

  beforeEach(async () => {
    users = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: ({ email, password }: CreateUserDto) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup({
      email: 'asdf@asdf.com',
      password: 'asdf',
    });

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    try {
      await service.signup({ email: 'asdf@asdf.com', password: 'asdf' });
      await service.signup({ email: 'asdf@asdf.com', password: 'asdf' });
    } catch (e) {
      console.log('🚀 ~ it ~ e:', e.message);
      expect(e.message).toBe("Email in use")
    }
  });


  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin({ email: 'asdfsdvsv@asdfsdvsv.com', password: 'asdfsdvsv' });
    } catch (e) {
      console.log('🚀 ~ it ~ e:', e.message);
      expect(e.message).toBe("User fot found")
    }
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup({ email: 'asdf@asdf.com', password: 'asdf' });
    try {
      await service.signin({ email: 'asdf@asdf.com', password: 'kdhbcduh' });
    } catch (e) {
      expect(e.message).toBe("Bad Creds")
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup({ email: 'asdf@asdf.com', password: 'asdf' });

    const user = await service.signin({
      email: 'asdf@asdf.com',
      password: 'asdf',
    });
    expect(user).toBeDefined();
  });
});
