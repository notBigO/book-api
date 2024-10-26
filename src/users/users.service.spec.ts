import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    const createUserDto = { email: 'test@example.com', password: 'test' };
    const user = {
      id: '1',
      email: createUserDto.email,
      password: createUserDto.password,
      hashPassword: async () => {},
    } as User;

    mockRepository.findOneBy.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(user);
    mockRepository.save.mockResolvedValue(user);

    const result = await usersService.create(createUserDto);
    expect(result).toEqual(user);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: createUserDto.email,
    });
    expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
    expect(mockRepository.save).toHaveBeenCalledWith(user);
  });

  it('should throw ConflictException if email exists', async () => {
    const existingUser = {
      id: '1',
      email: 'test@example.com',
      password: 'password',
      hashPassword: async () => {},
    } as User;

    mockRepository.findOneBy.mockResolvedValue(existingUser);

    await expect(usersService.create(existingUser)).rejects.toThrow(
      ConflictException,
    );
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: existingUser.email,
    });
  });

  it('should throw NotFoundException if user not found by ID', async () => {
    const id = '123';
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(usersService.findById(id)).rejects.toThrow(NotFoundException);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
  });
});
