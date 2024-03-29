'use strict';

/**
 * Up.
 */

exports.up = async knex => {
  await knex.raw('CREATE SCHEMA IF NOT EXISTS core');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS citext');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.schema
    .withSchema('core')
    .createTable('Users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('name').notNullable();
      table.enu('status', ['active', 'blocked', 'restricted']).defaultTo('restricted').notNullable();
      table.enu('role', ['admin', 'standard']).notNullable();
      table.timestamp('confirmedAt');
      table.timestamp('resetPasswordTokenAt');
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger
      LANGUAGE plpgsql SECURITY DEFINER
      AS $$
      BEGIN
        -- Return early if operation is not an update or insert.
        IF (TG_OP NOT IN ('UPDATE', 'INSERT')) THEN
          RETURN NEW;
        END IF;

        -- Update \`updatedAt\`.
        NEW."updatedAt" := NOW();
        RAISE NOTICE 'updatedAt was automatically updated by update_updated_at trigger';

        RETURN NEW;
      END;
    $$;
  `);

  await knex.raw(`
    CREATE TRIGGER update_updated_at BEFORE UPDATE ON core."Users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
  `);
};

/**
 * Down.
 */

exports.down = () => {
  throw new Error('Irreversible Migration');
};
