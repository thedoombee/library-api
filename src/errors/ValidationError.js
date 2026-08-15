const AppError = require('./AppError');
class ValidationError extends AppError {
  constructor(details) {
    super('Validation failed', 400);
    this.details = details;
  }
}
module.exports = ValidationError;