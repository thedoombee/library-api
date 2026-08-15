const { ValidationError } = require('../errors');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      return next(new ValidationError(result.error.flatten()));
    }

    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    next();
  };
}

module.exports = validate;