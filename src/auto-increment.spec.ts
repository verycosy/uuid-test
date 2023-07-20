import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CreateDateColumn,
  DataSource,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { bulk, bulkAsync } from './test-util';

describe('DB 성능 테스트', () => {
  let dataSource: DataSource;

  const DATA_COUNT = 10_000;
  const TIMEOUT = 1_000_000;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          database: 'test',
          username: 'test',
          password: 'test',
          entities: [AutoIncrementEntity],
          dropSchema: true,
          synchronize: true,
          entitySkipConstructor: true,
        }),
      ],
    }).compile();

    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Auto Increment', () => {
    it(
      'sync insert',
      async () => {
        await bulk(dataSource, 'insert', AutoIncrementEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'sync save',
      async () => {
        await bulk(dataSource, 'save', AutoIncrementEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'async insert',
      async () => {
        await bulkAsync(dataSource, 'insert', AutoIncrementEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'async save',
      async () => {
        await bulkAsync(dataSource, 'save', AutoIncrementEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'id 기준 정렬',
      async () => {
        await dataSource.getRepository(AutoIncrementEntity).find({
          order: {
            id: 'DESC',
          },
        });
      },
      TIMEOUT,
    );
  });
});

@Entity()
class AutoIncrementEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
}
