import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

jest.mock('../common/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('BooksController', () => {
  let booksController: BooksController;
  let booksService: BooksService;

  const mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    booksController = module.get<BooksController>(BooksController);
    booksService = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all books', async () => {
    const books = [
      {
        id: 1,
        title: 'Test Book',
        author: 'Author',
        description: 'Description',
        createdAt: new Date(),
      },
    ];
    mockBooksService.findAll.mockResolvedValue(books);

    const result = await booksController.findAll();
    expect(result).toBe(books);
    expect(booksService.findAll).toHaveBeenCalled();
  });

  it('should return one book by id', async () => {
    const book = {
      id: 1,
      title: 'Test Book',
      author: 'Author',
      description: 'Description',
      createdAt: new Date(),
    };
    mockBooksService.findOne.mockResolvedValue(book);

    const result = await booksController.findOne(1);
    expect(result).toBe(book);
    expect(booksService.findOne).toHaveBeenCalledWith(1);
  });

  it('should create a book', async () => {
    const createBookDto = {
      title: 'New Book',
      author: 'New Author',
      description: 'New Description',
    };
    const createdBook = {
      id: 1,
      ...createBookDto,
      createdAt: new Date(),
    };
    mockBooksService.create.mockResolvedValue(createdBook);

    const result = await booksController.create(createBookDto);
    expect(result).toBe(createdBook);
    expect(booksService.create).toHaveBeenCalledWith(createBookDto);
  });
});
