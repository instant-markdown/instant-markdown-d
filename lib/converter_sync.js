var util = require('util'),
    NotImplementedError = require('./not_implemented_error');

module.exports = ConverterSync;

function ConverterSync(){}
ConverterSync.prototype.render = function(rawInput){
  throw new NotImplementedError('render');
}
