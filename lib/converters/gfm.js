var rs            = require('robotskirt'),
    hljs          = require('highlight.js'),
    util          = require('util'),
    ConverterSync = require('../converter_sync');


util.inherits(GfmConverter, ConverterSync);

function GfmConverter(){
  var renderer = new rs.HtmlRenderer();

  renderer.blockcode = function(code, language) {
    if (language === undefined || language === null) {
      //No language was provided, don't highlight
      return '<pre>' + rs.houdini.escapeHTML(code) + '</pre>';
    }

    var highlighted;
    try {   // hackish way to guard against unsupported languages
      highlighted = hljs.highlight(language, code).value;
    }
    catch(error) {
      return '<pre>' + rs.houdini.escapeHTML(code) + '</pre>';
    }
    return '<pre>' + highlighted + '</pre>';
  };

  renderer.doc_header = function(){
    return '<div class="md"><article>';
  }

  renderer.doc_footer = function(){
    return '</article></div>';
  }

  this.parser = new rs.Markdown(renderer, [rs.EXT_FENCED_CODE,
                                          rs.EXT_NO_INTRA_EMPHASIS,
                                          rs.EXT_AUTOLINK,
                                          rs.EXT_STRIKETHROUGH,
                                          rs.EXT_LAX_SPACING,
                                          rs.EXT_SUPERSCRIPT,
                                          rs.HTML_HARD_WRAP,
                                          rs.EXT_TABLES]);
  
}

GfmConverter.prototype.render = function(inputAndOptions){
  return this.parser.render(inputAndOptions.shift());
}

module.exports = new GfmConverter();
