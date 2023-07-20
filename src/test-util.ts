import { DataSource, ObjectLiteral } from 'typeorm';

export const bulk = async <T extends ObjectLiteral>(
  dataSource: DataSource,
  taskType: 'insert' | 'save',
  entity: new () => T,
  count: number,
) => {
  const repository = dataSource.getRepository(entity);

  for (let i = 0; i < count; i++) {
    await repository[taskType](new entity());
  }
};

export const bulkAsync = async <T extends ObjectLiteral>(
  dataSource: DataSource,
  taskType: 'insert' | 'save',
  entity: new () => T,
  count: number,
) => {
  const repository = dataSource.getRepository(entity);
  const tasks = [];

  for (let i = 0; i < count; i++) {
    tasks.push(repository[taskType](new entity()));
  }

  await Promise.all(tasks);
};
