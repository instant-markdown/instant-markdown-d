var util                = require('util'),
    NotImplementedError = require('./not_implemented_error');

module.exports = Converter;

function Converter(){}
Converter.prototype.render = function(inputAndOptions, callback){
  throw new NotImplementedError('render');
}
Converter.prototype.extra_params = [];
Converter.prototype.async = false;
