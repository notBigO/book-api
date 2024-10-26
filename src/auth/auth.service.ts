import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { LoginDto } from 'src/users/dtos/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    console.log(
      'AuthService initialized with JWT secret:',
      this.configService.get('JWT_SECRET'),
    );
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log('Login attempt for email:', loginDto.email);

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
    };

    console.log('About to sign JWT with payload:', payload);
    console.log('Current JWT secret:', this.configService.get('JWT_SECRET'));

    try {
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('JWT signing error:', error);
      throw error;
    }
  }
}
