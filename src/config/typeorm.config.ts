import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  synchronize: true,
  autoLoadEntities: true,
  ssl: {
    rejectUnauthorized: false,
  },
});
