import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SignInAuthDto } from '@app/shared/dto/auth.dto';
import { User } from 'apps/users/src/user.entity';

@Injectable()
export class AuthRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async validateUser(loginUserDto: SignInAuthDto): Promise<User> {
    const { email, password } = loginUserDto;

    const user = await this.findOneBy({ email });
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}
