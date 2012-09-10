#!/usr/bin/env ruby
require 'rubygems'
require 'redcarpet'
require 'pathname'
# require 'pygments.rb'
$LOAD_PATH << '/Users/syeo/Downloads/MSNexploder-pygments.rb-ecc543e/lib'
require '/Users/syeo/Downloads/MSNexploder-pygments.rb-ecc543e/lib/pygments'

# $mutalisk = Mutex.new

class HTMLWithPygments < Redcarpet::Render::XHTML
	def doc_header()
    ghf_css_path = File.join File.dirname(File.dirname Pathname.new(__FILE__).realpath),
                              'ghf_marked.css'
    '<style>' + File.read(ghf_css_path) + '</style><div class="md"><article>'
	end
  def doc_footer
    '</article></div>'
  end
	def block_code(code, language)
    Pygments.highlight(code, :lexer => language, :options => {:encoding => 'utf-8'})
  rescue
    code
	end
end

class HTMLWithPygmentsUnstyled < HTMLWithPygments
# class HTMLWithPygmentsUnstyled < Redcarpet::Render::XHTML
  def doc_header
    '<div class="md"><article>'
	end
  # def doc_footer
    # '</article></div>'
  # end
	# def block_code(code, language)
    # D.bg :in
		# super
	# end
	# def block_code(code, language)
    # D.bg :in
		# Pygments.highlight(code, :lexer => language, :options => {:encoding => 'utf-8'})
	# end
end

require 'benchmark'
class Docter
  def initialize(*args)
    renderer = args.include?(:unstyled) ? HTMLWithPygmentsUnstyled : HTMLWithPygments
    @markdown = Redcarpet::Markdown.new(renderer,
      :fenced_code_blocks => true,
      :no_intra_emphasis => true,
      :autolink => true,
      :strikethrough => true,
      :lax_html_blocks => true,
      :superscript => true,
      :hard_wrap => true,
      :tables => true,
      :xhtml => true)
  end

  def from_markdown(text)
    # $mutalisk.synchronize{ @markdown.render(text) }
    # a = nil
    @markdown.render(text)
    # puts Benchmark.measure{ a = @markdown.render(text) }
    # a
  end
end

puts Docter.new(:unstyled).from_markdown(STDIN.read)
