import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity'; // Fix the import path
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user and return user data', async () => {
    const email = 'test@example.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: '1',
      email,
      password: hashedPassword,
    } as User;

    mockRepository.findOneBy.mockResolvedValue(user);

    const result = await authService.validateUser(email, password);
    expect(result).toEqual({ id: user.id, email: user.email });
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email });
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    const loginDto = { email: 'invalid@example.com', password: 'test' };
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: loginDto.email,
    });
  });

  it('should return access token when login is successful', async () => {
    const loginDto = { email: 'test@example.com', password: 'password' };
    const user = {
      id: '1',
      email: loginDto.email,
      password: await bcrypt.hash(loginDto.password, 10),
    } as User;

    jest.spyOn(authService, 'validateUser').mockResolvedValue({
      id: user.id,
      email: user.email,
    });

    const result = await authService.login(loginDto);

    expect(result).toEqual({
      access_token: 'test-token',
      user: {
        id: user.id,
        email: user.email,
      },
    });
    expect(mockJwtService.sign).toHaveBeenCalled();
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
  });
});
