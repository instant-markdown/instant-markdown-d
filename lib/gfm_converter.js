var rs    = require('robotskirt'),
    hljs  = require('highlight.js');

var renderer = new rs.HtmlRenderer();

renderer.blockcode = function(code, language) {
  if (language === undefined || language === null) {
    //No language was provided, don't highlight
    return '<pre>' + rs.houdini.escapeHTML(code) + '</pre>';
  }
  return hljs.highlight(language, code).value;
};

renderer.doc_header = function(){
  return '<div class="md"><article>';
}

renderer.doc_footer = function(){
  return '</article></div>';
}

var parser = new rs.Markdown(renderer, [rs.EXT_FENCED_CODE,
                                        rs.EXT_NO_INTRA_EMPHASIS,
                                        rs.EXT_AUTOLINK,
                                        rs.EXT_STRIKETHROUGH,
                                        rs.EXT_LAX_SPACING,
                                        rs.EXT_SUPERSCRIPT,
                                        rs.HTML_HARD_WRAP,
                                        rs.EXT_TABLES]);

exports.render = function(rawMarkup){
  return parser.render(rawMarkup);
}
