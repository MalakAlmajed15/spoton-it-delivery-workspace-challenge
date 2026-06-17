import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RequestUser } from '../common/request-user';

const SEEDED_USER: RequestUser & { password: string } = {
  id: 'usr_intern_001',
  name: 'Intern Candidate',
  email: 'intern@spoton.test',
  role: 'intern',
  password: 'intern123',
};

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  login(email: string, password: string) {
    if (email !== SEEDED_USER.email || password !== SEEDED_USER.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user: RequestUser = {
      id: SEEDED_USER.id,
      name: SEEDED_USER.name,
      email: SEEDED_USER.email,
      role: SEEDED_USER.role,
    };

    return {
      accessToken: this.jwt.sign(user),
      user,
    };
  }
}
