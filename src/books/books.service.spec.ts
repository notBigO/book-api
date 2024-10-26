import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let booksService: BooksService;
  let booksRepository: Repository<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    booksService = module.get<BooksService>(BooksService);
    booksRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  it('should create a book', async () => {
    const bookData = {
      title: 'New Book',
      author: 'Author',
      description: 'Desc',
      createdAt: new Date(),
    };
    const savedBook = { id: 1, ...bookData };
    jest.spyOn(booksRepository, 'save').mockResolvedValue(savedBook);

    expect(await booksService.create(bookData)).toEqual(savedBook);
  });

  it('should throw NotFoundException if book is not found', async () => {
    jest.spyOn(booksRepository, 'findOneBy').mockResolvedValue(null);

    await expect(booksService.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
