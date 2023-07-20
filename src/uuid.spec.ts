import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateDateColumn, DataSource, Entity, PrimaryColumn } from 'typeorm';
import { v4 } from 'uuid';
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
          entities: [UUIDEntity],
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

  describe('UUID', () => {
    it(
      'sync insert',
      async () => {
        await bulk(dataSource, 'insert', UUIDEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'sync save',
      async () => {
        await bulk(dataSource, 'save', UUIDEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'async insert',
      async () => {
        await bulkAsync(dataSource, 'insert', UUIDEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'async save',
      async () => {
        await bulkAsync(dataSource, 'save', UUIDEntity, DATA_COUNT);
      },
      TIMEOUT,
    );

    it(
      'createdAt 기준 정렬',
      async () => {
        await dataSource.getRepository(UUIDEntity).find({
          order: {
            createdAt: 'DESC',
          },
        });
      },
      TIMEOUT,
    );
  });
});

@Entity()
class UUIDEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  constructor() {
    this.id = v4();
  }
}
