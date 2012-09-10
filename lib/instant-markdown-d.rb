require 'rubygems'
require "instant-markdown-d/version"
require 'sinatra'
# require 'sinatra-websocket'
require 'em-websocket'
require 'docter'
require 'thread'
# require 'redcarpet'
# require 'pygments.rb'
# require '/Users/syeo/Projects/process_pool/lib/process_pool'

require 'quick-debug'

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
    # $counter = 0
    $to_process = Queue.new
    $free_procs = 4
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
        $counter += 1
        $latest_markdown = request.body.read
      end
      D.bg(:in){'$counter'}
      InstantMarkdown.update_page
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
    if not $to_process.empty?
      if $free_procs > 0
        # reduce queue to the number of processes available
        if $to_process.size > $free_procs
          num_to_discard = $to_process.size - $free_procs
          num_to_discard.times{ $to_process.pop }
        end
        
        $to_process.size.times do
          EM.defer(proc{ |new_html| $free_procs += 1; $socket.send new_html }) do
            html = nil
            IO.popen($converter_command) do |command|
              command << `#{$to_process.pop}`
              command.close_write
              html = command.read
            end
            html
          end
          $free_procs -= 1
        end
      else
        ($to_process.size - 1).times{ $to_process.pop }
        EM.add_timer(1){ update_page }
      end   # if free_procs > 0
    end   # if not $to_process.empty?
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
