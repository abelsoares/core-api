
/**
 * Export schema.
 */

module.exports = {
  $id: 'empty-object',
  oneOf: [
    { items: { minProperties: 1, type: 'object' }, minItems: 1, type: 'array' },
    { minProperties: 1, type: 'object' }
  ]
};
