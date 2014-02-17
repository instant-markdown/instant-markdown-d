var pandoc    = require('pdc'),
    util      = require('util'),
    Converter = require('../converter');


util.inherits(PandocConverter, Converter);

function PandocConverter(){}

PandocConverter.prototype.render = function(inputAndOptions, callback){
  var rawInput    = inputAndOptions.shift(),
      inputFormat = inputAndOptions.shift();

  pandoc(rawInput, inputFormat, 'html', callback(err, result));
}
PandocConverter.prototype.extra_params = ['format'];

module.exports = new PandocConverter();