'use strict';

/**
 * Module dependencies.
 */

const AbstractModel = require('src/core/models/abstract-model');
const EntityNotFoundError = require('src/core/errors/entity-not-found-error');
const InvalidArgumentError = require('src/core/errors/invalid-argument-error');
const logger = require('src/core/logging/logger');
const mask = require('json-mask');
const { get } = require('lodash');
const { validate } = require('src/core/validator');

/**
 * Export `AbstractManager`.
 */

module.exports = class AbstractManager {

  /**
   * Constructor.
   */

  constructor(model) {
    if (!model) {
      throw new InvalidArgumentError('`model` must not be null');
    }

    if (model instanceof AbstractModel === false) {
      throw new InvalidArgumentError('`model` must be an instance of AbstractModel');
    }

    this.logger = logger(`${model.name}-manager`);
    this.model = model;
    this.query = ({ sort = [{ direction: 'desc', field: 'updatedAt' }] } = {}) => {
      const query = model.knex(model.tableName).withSchema(model.tableSchema);

      sort.forEach(order => query.orderBy(order.field, order.direction));

      return query;
    };
  }

  /**
   * Create.
   */

  async create({ data, multiple = false, returning = '*', transaction } = {}) {
    this.logger.debug({ data }, `Creating ${this.name}`);

    validate(data, 'empty-object');
    validate(data, this.model.name);

    const query = this.query()
      .insert(data)
      .returning(returning);

    if (transaction) {
      query.transacting(transaction);
    }

    const entities = await query;

    this.logger.info({ entities }, `Created ${entities.length} entities`);

    return multiple ? entities : entities[0];
  }

  /**
   * Delete.
   */

  async delete({ returning = '*', transaction, where }) {
    validate({ where }, { properties: { where: { minProperties: 1, type: 'object' } } });

    const query = this.query()
      .delete()
      .returning(returning)
      .where(where);

    if (transaction) {
      query.transacting(transaction);
    }

    this.logger.debug({ query: query.toString() }, `Deleting entities from table ${this.model.tableName}`);

    const entities = await query;

    if (entities.length === 0) {
      throw new EntityNotFoundError();
    }

    return entities;
  }

  /**
   * Find.
   */

  async find({ limit, sort, transaction, where = {}, whereNot = {} } = {}) {
    const query = this.query({ sort })
      .where(where)
      .whereNot(whereNot);

    if (limit) {
      query.limit(limit);
    }

    if (transaction) {
      query.transacting(transaction);
    }

    this.logger.debug({ query: query.toString() }, `Fetching entities from table ${this.model.tableName}`);

    return await query;
  }

  /**
   * Find one.
   */

  async findOne({ transaction, where }) {
    validate({ where }, { properties: { where: { minProperties: 1, type: 'object' } }, required: ['where'] });

    const [entity] = await this.find({ limit: '1', transaction, where });

    if (!entity) {
      throw new EntityNotFoundError();
    }

    return entity;
  }

  /**
   * Mask an object using the specified scope.
   */

  mask({ data, scope = 'public' }) {
    const modelMask = this.model.getMask({ scope });

    validate(modelMask, { minLength: 1, type: 'string' });

    return mask(data, modelMask);
  }

  /**
   * Search.
   */

  async search({ page, sort, where = {} } = {}) {
    const query = this.query({ sort })
      .where(where);

    const { total } = await this.model
      .knex(this.model.tableName)
      .withSchema(this.model.tableSchema)
      .select(this.model.knex.raw('count(*)::integer AS total'))
      .where(where)
      .first();

    if (page) {
      const limit = get(page, 'size');

      query.offset((get(page, 'number') - 1) * limit).limit(limit);
    }

    this.logger.debug({ query: query.toString() }, `Searching entities from table ${this.model.tableName}`);

    const data = await query;

    return {
      data,
      total
    };
  }

  /**
   * Update.
   */

  async update({ data, multiple = false, returning = '*', transaction, where } = {}) {
    this.logger.debug({ data }, `Updating ${this.name}`);

    validate(data, 'empty-object');
    validate(data, this.model.name);

    const query = this.query()
      .returning(returning)
      .update(data)
      .where(where);

    if (transaction) {
      query.transacting(transaction);
    }

    const entities = await query;

    this.logger.info({ entities }, `Updated ${entities.length} entities`);

    if (entities.length === 0) {
      throw new EntityNotFoundError();
    }

    return multiple ? entities : entities[0];
  }

};
