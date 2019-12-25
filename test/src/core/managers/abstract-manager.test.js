'use strict';

/**
 * Module dependencies.
 */

const AbstractManager = require('src/core/managers/abstract-manager');
const AbstractModel = require('src/core/models/abstract-model');
const EntityNotFoundError = require('src/core/errors/entity-not-found-error');
const fixtures = require('test/utils/fixtures');
const InvalidArgumentError = require('src/core/errors/invalid-argument-error');
const uuid = require('uuid/v4');
const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { map } = require('lodash');

/**
 * Test `AbstractManager`.
 */

describe('AbstractManager', () => {
  const model = new AbstractModel();

  beforeAll(async () => {
    model.name = 'foo';
    model.schema = { $id: model.name, properties: { id: { format: 'uuid', type: 'string' } } };
    model.tableName = 'Foos';
    model.tableSchema = 'core';
    fixtures.loadJsonSchema(model.schema);

    await model.knex.schema
      .withSchema(model.tableSchema)
      .createTable(model.tableName, table => {
        table.uuid('id').primary().defaultTo(model.knex.raw('uuid_generate_v4()'));
        table.string('unique', 3).unique();
        table.string('notUnique', 3);
        table.timestamp('createdAt').notNullable().defaultTo(model.knex.raw('now()'));
        table.timestamp('updatedAt').notNullable().defaultTo(model.knex.raw('now()'));
      });
  });

  describe('constructor()', () => {
    it('should throw an error if `model` is missing', () => {
      try {
        // eslint-disable-next-line no-new
        new AbstractManager();

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidArgumentError);
        expect(e.message).toBe('`model` must not be null');
      }
    });

    it('should throw an error if `model` is not an instance of `AbstractModel`', () => {
      try {
        // eslint-disable-next-line no-new
        new AbstractManager({ foo: 'bar' });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidArgumentError);
        expect(e.message).toBe('`model` must be an instance of AbstractModel');
      }
    });

    it('should provide `query()` with order by `updatedAt` `desc` by default', () => {
      const manager = new AbstractManager(model);
      const query = manager.query().toString();

      expect(query).toBe('select * from "core"."Foos" order by "updatedAt" desc');
    });

    it('should provide custom `query()` if `sort` is defined', () => {
      const manager = new AbstractManager(model);
      const query = manager.query({ sort: [{ direction: 'asc', field: 'foo' }, { direction: 'desc', field: 'updatedAt' }] }).toString();

      expect(query).toBe('select * from "core"."Foos" order by "foo" asc, "updatedAt" desc');
    });
  });

  describe('create()', () => {
    it('should throw an error if `data` is not defined', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.create();

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `data` is an empty array', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.create({ data: [] });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `data` is an array with an empty object', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.create({ data: [{}] });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `data` is an empty object', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.create({ data: {} });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if it fails to validate the model schema', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.create({ data: { id: 'bar', unique: 'foo' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should return all created objects if `multiple` is true', async () => {
      const manager = new AbstractManager(model);

      const result = await manager.create({ data: [{ unique: 'foo' }, { unique: 'bar' }], multiple: true });

      expect(result.length).toBe(2);
      expect(result[0].unique).toBe('foo');
      expect(result[1].unique).toBe('bar');
    });

    it('should do nothing when inside a failing transaction', async () => {
      const manager = new AbstractManager(model);
      const existing = await manager.create({ data: { unique: 'foo' } });

      try {
        await manager.model.knex.transaction(async transaction => {
          await manager.create({ data: [{ unique: 'bar' }, { unique: 'biz' }], transaction });

          throw new Error();
        });

        fail();
      } catch (e) {
        const final = await manager.find();

        expect([existing]).toEqual(final);
      }
    });
  });

  describe('delete()', () => {
    it('should throw an error if `where` is empty', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.delete({ where: {} });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `where` is not an object', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.delete({ where: () => 1 });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should delete records', async () => {
      const manager = new AbstractManager(model);

      await manager.create({ data: [{ unique: 'foo' }, { unique: 'bel' }] });
      await manager.delete({ where: { unique: 'foo' } });

      const all = await manager.find();

      expect(all.length).toBe(1);
      expect(all[0].unique).toBe('bel');
    });

    it('should do nothing when inside a failing transaction', async () => {
      const manager = new AbstractManager(model);
      const existing = await manager.create({ data: { unique: 'foo' } });

      try {
        await manager.model.knex.transaction(async transaction => {
          await manager.delete({ transaction, where: { unique: 'foo' } });

          throw new Error();
        });

        fail();
      } catch (e) {
        const final = await manager.find();

        expect([existing]).toEqual(final);
      }
    });
  });

  describe('find()', () => {
    it('should return an empty array if no entities are found', async () => {
      const manager = new AbstractManager(model);
      const results = await manager.find({ where: { id: uuid() } });

      expect(results).toEqual([]);
    });

    it('should return all existing objects before failing transaction', async () => {
      const manager = new AbstractManager(model);
      const existing = await manager.create({ data: { unique: 'foo' } });

      try {
        await manager.model.knex.transaction(async transaction => {
          const reverted = await manager.create({ data: { unique: 'bar' }, transaction });
          const all = await manager.find({ transaction });

          expect(all).toEqual([reverted, existing]);

          throw new Error();
        });

        fail();
      } catch (e) {
        expect(e).not.toHaveProperty('matcherResult');

        const final = await manager.find();

        expect([existing]).toEqual(final);
      }
    });
  });

  describe('findOne()', () => {
    it('should throw an error if property `where` is not defined', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.findOne({});

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `where` is empty', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.findOne({ where: {} });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if the search criteria returned no result', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.findOne({ where: { unique: 'foo' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(EntityNotFoundError);
      }
    });

    it('should call `find`', async () => {
      const manager = new AbstractManager(model);
      const parameters = { transaction: 'foo', where: { foo: 'bar' } };

      jest.spyOn(manager, 'find').mockReturnValue(['biz']);

      await manager.findOne(parameters);

      expect(manager.find).toHaveBeenCalled();
      expect(manager.find).toHaveBeenCalledWith({ limit: '1', ...parameters });
    });
  });

  describe('mask', () => {
    it('should throw an error if the mask is empty', () => {
      const manager = new AbstractManager(model);

      try {
        manager.mask({ data: { foo: 'bar' }, scope: 'biz' });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });
  });

  describe('search()', () => {
    it('should return an empty list if no entities are found', async () => {
      const manager = new AbstractManager(model);
      const results = await manager.search();

      expect(results).toEqual({ data: [], total: 0 });
    });

    it('should return all entities if `page` option is empty', async () => {
      const manager = new AbstractManager(model);

      await Promise.all([
        manager.create({ data: [{ unique: 'bar' }] }),
        manager.create({ data: [{ unique: 'foo' }] })
      ]);

      const { data, total } = await manager.search();

      expect(data.length).toBe(2);
      expect(total).toBe(2);
    });

    it('should return the first page of entities', async () => {
      const manager = new AbstractManager(model);

      await Promise.all([
        manager.create({ data: [{ unique: 'bar' }] }),
        manager.create({ data: [{ unique: 'biz' }] }),
        manager.create({ data: [{ unique: 'foo' }] })
      ]);

      const { data, total } = await manager.search({ page: { number: 1, size: 2 } });

      expect(data.length).toBe(2);
      expect(total).toBe(3);
    });

    it('should return the last page of entities', async () => {
      const manager = new AbstractManager(model);

      await Promise.all([
        manager.create({ data: [{ unique: 'bar' }] }),
        manager.create({ data: [{ unique: 'biz' }] }),
        manager.create({ data: [{ unique: 'foo' }] })
      ]);

      const { data, total } = await manager.search({ page: { number: 2, size: 2 } });

      expect(data.length).toBe(1);
      expect(total).toBe(3);
    });

    it('should return empty list if page number is greater than maximum number of pages', async () => {
      const manager = new AbstractManager(model);

      await Promise.all([
        manager.create({ data: [{ unique: 'bar' }] }),
        manager.create({ data: [{ unique: 'biz' }] }),
        manager.create({ data: [{ unique: 'foo' }] })
      ]);

      const { data, total } = await manager.search({ page: { number: 3, size: 2 } });

      expect(data.length).toBe(0);
      expect(total).toBe(3);
    });
  });

  describe('update()', () => {
    it('should throw an error if `data` is not defined', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.update();

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `data` is an empty array', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.update({ data: [] });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `data` is an array with an empty object', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.update({ data: [{}] });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if `data` is an empty object', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.update({ data: {} });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an error if it fails to validate the model schema', async () => {
      const manager = new AbstractManager(model);

      try {
        await manager.update({ data: { id: 'bar', unique: 'foo' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should update the entity', async () => {
      const manager = new AbstractManager(model);

      await manager.create({ data: [{ unique: 'bar' }, { unique: 'biz' }] });
      await manager.update({ data: { unique: 'qux' }, where: { unique: 'bar' } });

      const after = await manager.find();

      expect(map(after, 'unique')).toEqual(['biz', 'qux']);
    });

    it('should return all updated objects if `multiple` is true', async () => {
      const manager = new AbstractManager(model);

      await manager.create({ data: [{ notUnique: 'qux', unique: 'bar' }, { notUnique: 'qux', unique: 'foo' }] });

      const result = await manager.update({
        data: { notUnique: 'biz' },
        multiple: true,
        where: { notUnique: 'qux' }
      });

      expect(result.length).toBe(2);
      expect(result[0].unique).toBe('bar');
      expect(result[1].unique).toBe('foo');
    });

    it('should do nothing when inside a failing transaction', async () => {
      const manager = new AbstractManager(model);
      const existing = await manager.create({ data: { unique: 'foo' } });

      try {
        await manager.model.knex.transaction(async transaction => {
          await manager.update({ data: { unique: 'biz' }, transaction, where: { unique: 'foo' } });

          throw new Error();
        });

        fail();
      } catch (e) {
        const final = await manager.find();

        expect([existing]).toEqual(final);
      }
    });
  });
});
