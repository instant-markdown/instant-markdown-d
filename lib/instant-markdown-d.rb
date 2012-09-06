require "instant-markdown-d/version"
require 'rubygems'
require 'sinatra'
# require 'sinatra-websocket'
require 'em-websocket'
require 'docter'
# require 'redcarpet'
# require 'pygments.rb'
# require '/Users/syeo/Projects/process_pool/lib/process_pool'

# require 'quick-debug'

$socket = nil
EventMachine.run do

# class MarkdownConvertTask
  # def initialize markdown, sock
    # @markdown = markdown
    # D.bg{'sock'}
    # @socket = sock
  # end
# 
  # def run
    # new_html = Docter.new(:unstyled).from_markdown(@markdown)
    # D.bg{'$socket'}
    # @socket.send new_html
  # end
# end

module InstantMarkdown
  class Server < Sinatra::Base
    PORT = 8090
    DOCTER = Docter.new :unstyled
    $mutalisk = Mutex.new
    $counter = 0
    $latest_markdown = ''
    # @@socket = nil

    enable :static
    set :port, PORT

    get '/' do
      send_file File.expand_path('index.html', settings.public_folder)
    end

    put '*' do
      # D.bg{'request'}
      # begin
      # new_html = Thread.exclusive{ Docter.new(:unstyled).from_markdown(request.body.read) }
      $mutalisk.synchronize do
        # $counter += 1
        $latest_markdown = request.body.read
      end
      EventMachine.next_tick{ InstantMarkdown.update_page }
      # rescue Exception => e
      # new_html = request.body.read
      # D.bg(:in){'$socket'}
      # POOL.schedule MarkdownConvertTask, request.body.read, $socket
      # POOL.schedule MarkdownConvertTask, request.body.read, Docter.new
      ##D.bg{'new_html'}
      # puts "#{e.message}\n#{e.backtrace.join("\n")}"
      # else
      # $socket.send new_html
      # end
    end

    delete '*' do
      # @@socket.close if @@socket
      # @@socket.destroy if @@socket
      # POOL.shutdown
      EventMachine.stop_event_loop
    end

    configure do
      # POOL = ProcessPool.new(1)
      # POOL.start
      if RUBY_PLATFORM.downcase =~ /darwin/
        system("open -g http://localhost:#{PORT} &")
      else  # assume unix/linux
        system("xdg-open http://localhost:#{PORT} &")
      end
    end
  end

  def self.update_page
    markdown = ''
    $mutalisk.synchronize{ markdown = $latest_markdown.clone }
    new_html = Docter.new(:unstyled).from_markdown(markdown)
    $socket.send new_html
  end

  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8091) do |ws|
    ws.onopen do
      # settings.socket = ws
      $socket = ws
    end
    # ws.onclose do
      # @@socket.send 'ping'
    # end
  end

  Server.run!
  p 'l'
end
end
