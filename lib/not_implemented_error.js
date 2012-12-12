var util = require('util');

module.exports = NotImplementedError;

function NotImplementedError(message) {
  Error.captureStackTrace(this, NotImplementedError); //super helper method to include stack trace in error object

  this.name = 'NotImplementedError';
  this.message = message;
}
util.inherits(NotImplementedError, Error);
