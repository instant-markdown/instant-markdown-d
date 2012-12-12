var util                = require('util'),
    NotImplementedError = require('./not_implemented_error');

module.exports = Converter;

function Converter(){}
ConverterSync.prototype.render = function(inputAndOptions, callback){
  throw new NotImplementedError('render');
}
