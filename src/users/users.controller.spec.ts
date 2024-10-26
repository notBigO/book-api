import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should register a user', async () => {
    const registerDto = { email: 'test@example.com', password: 'password' };
    const user = {
      id: '1',
      email: registerDto.email,
      password: registerDto.password,
      hashPassword: async () => {},
    };

    jest.spyOn(usersService, 'create').mockResolvedValue(user);

    expect(await usersController.register(registerDto)).toBe(user);
  });

  it('should login a user', async () => {
    const loginDto = { email: 'test@example.com', password: 'password' };
    const user = { id: '1', email: loginDto.email };
    const result = { access_token: 'token', user };
    jest.spyOn(authService, 'login').mockResolvedValue(result);

    expect(await usersController.login(loginDto)).toBe(result);
  });
});
