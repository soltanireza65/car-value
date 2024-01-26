import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

import { CurrentUser, Serialize } from '@app/common';
import { AuthService } from './auth.service';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from '@app/common/guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)

// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // @UseInterceptors(CurrentUserInterceptor)
  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: any) {
    return user;
  }
  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Post('signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Session() session: any,
  ) {
    const user = await this.authService.signup(createUserDto);
    session.userId = user.id;
    return user;
  }
  @Post('signin')
  async signin(@Body() payload: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(payload);
    session.userId = user.id;
    return user;
  }
  @Post('signout')
  async signOut(@Body() payload: CreateUserDto, @Session() session: any) {
    session.userId = null;
  }

  @Get(':id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
