require 'rubygems'
require "instant-markdown-d/version"
require 'sinatra'
require 'em-websocket'
require 'thread'

require 'quick-debug'

$socket = nil
EventMachine.run do

module InstantMarkdown
  class Server < Sinatra::Base
    PORT = 8090
    $mutalisk = Mutex.new
    $to_process = Queue.new
    $free_procs = 4
    $converter_command = File.expand_path 'docter', File.dirname(__FILE__)+'/../bin'
    D.bg{'$converter_command'}
    # @@socket = nil

    enable :static
    set :port, PORT

    get '/' do
      send_file File.expand_path('index.html', settings.public_folder)
    end

    put '*' do
      $to_process << request.body.read
      InstantMarkdown.update_page
    end

    delete '*' do
      # @@socket.close if @@socket
      # @@socket.destroy if @@socket
      # POOL.shutdown
      EventMachine.stop_event_loop
    end

    configure do
      if RUBY_PLATFORM.downcase =~ /darwin/
        system("open -g http://localhost:#{PORT} &")
      else  # assume unix/linux
        system("xdg-open http://localhost:#{PORT} &")
      end
    end
  end

  def self.update_page
    D.bg :in
    if $free_procs > 0
      D.bg :in
      # reduce queue to the number of processes available
      if $to_process.size > $free_procs
        num_to_discard = $to_process.size - $free_procs
        num_to_discard.times{ $to_process.pop }
      end
      
      $to_process.size.times do
        D.bg :in
        EM.defer(nil, proc{ |new_html| $free_procs += 1; $socket.send new_html }) do
          D.bg :in
          html = nil
          IO.popen($converter_command, 'r+') do |command|
            D.bg :in
            lala = $to_process.pop
            command << lala
            # command << $to_process.pop
            command.close_write
            html = command.read
          end
          html
        end
        $free_procs -= 1
      end
    elsif not $to_process.empty?
      ($to_process.size - 1).times{ $to_process.pop }
      EM.add_timer(1){ update_page }
    end   # if free_procs > 0
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
