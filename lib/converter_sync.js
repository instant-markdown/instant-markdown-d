var util = require('util'),
    NotImplementedError = require('./not_implemented_error');

module.exports = ConverterSync;

function ConverterSync(){}
ConverterSync.prototype.render = function(rawInput){
  throw new NotImplementedError('render');
}
ConverterSync.prototype.extra_params = [];
ConverterSync.prototype.async = true;
