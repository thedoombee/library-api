const AppError = require('./AppError');
class ServerError extends AppError {
  constructor(message = 'Server Error') {
    super(message, 500);
  }
}
module.exports = ServerError;