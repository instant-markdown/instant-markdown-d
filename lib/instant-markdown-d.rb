# require "instant-markdown-d/version"
require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'em-websocket'
require '/quick-debug'
require 'thread'
require 'pp'

$socket = nil
# D.disable :all
EventMachine.run do

module InstantMarkdown
  class Server < Sinatra::Base
    PORT = 8090
    $mutalisk = Mutex.new
    # $to_process = Queue.new
    $to_process = []
    $free_procs = 4
    # $converter_command = File.expand_path 'docter', File.dirname(__FILE__)+'/../bin'
    $converter_command = 'gfm'
    # D.bg{'$converter_command'}
    # @@socket = nil

    enable :static
    set :port, PORT
    # set :server, 'webrick'
    # set :threaded, false

    get '/' do
      send_file File.expand_path('index.html', settings.public_folder)
    end

    put '*' do
      # D.bg{'request'}
      $to_process << Conversion.new(request.body.read, Time.now)
      # p $to_process
      EM.defer{ InstantMarkdown.update_page }
      # status 200
      halt 200
    end

    delete '*' do
      EM.add_timer(0.2) do    # HACK to wait for response to complete
        EM.stop
        exit
      end
      status 200
    end

    configure do
      if RUBY_PLATFORM.downcase =~ /darwin/
        system("open -g http://localhost:#{PORT} &")
      else  # assume unix/linux
        system("xdg-open http://localhost:#{PORT} &")
      end
    end
  end

  class Conversion
    attr_accessor :success, :html, :queued_time, :raw_content
    def initialize(raw_content, queued_time)
      @raw_content = raw_content
      @queued_time = queued_time
    end
  end

  def self.get_displayer
    Proc.new do |conversion|
      # D.bg(:in){'conversion'}
      # $mutalisk.synchronize do
        $free_procs += 1
        if conversion.success && conversion.queued_time > $newest_displayed.queued_time
        # if conversion.success
          $newest_displayed = conversion
          printf "sending %10.5f\n" % conversion.queued_time.to_f
          $socket.send(conversion.html)
        end
      # end
    end
  end

  $newest_displayed = Conversion.new('', Time.at(0))

  # Markdown conversion takes a long time and is CPU intensive, so we limit the
  # amount of conversions we're doing at a time. We also use processes instead of
  # threads using Docter code directly because pygments.rb is nutorious for segfaulting.
  #
  # If there are any available processes
  # - remove oldest raw markdowns until there is only one
  #   left per available process
  # - Use available processes to convert and display remaining RMDs starting
  #   from oldest first.
  # else remove all raw markdowns except the most recent one (that's the one
  # the user cares about the most) and schedule an `update_page` call after 1 second
  def self.update_page
    D.bg(:in){'$free_procs'}
    if $free_procs > 0
      D.bg :in
      # reduce queue to the number of processes available
      if $to_process.size > $free_procs
        num_to_discard = $to_process.size - $free_procs
        num_to_discard.times{ $to_process.shift }
      end
      
      $to_process.size.times do
        # D.bg :in
        # EM.defer(nil, get_displayer) do
          D.bg :in
          $free_procs -= 1
          html, is_converted = nil, nil
          conversion = $to_process.shift
          IO.popen($converter_command, 'r+') do |command|
            # D.bg :in
            command << conversion.raw_content
            command.close_write
            conversion.html = command.read
            conversion.success = Process.waitpid2(command.pid)[1].success?
          end
          # $mutalisk.synchronize do
            $free_procs += 1
            if conversion.success && conversion.queued_time > $newest_displayed.queued_time
            # if conversion.success
              $newest_displayed = conversion
              printf "sending %10.5f\n" % conversion.queued_time.to_f
              $socket.send(conversion.html)
            end
          # end
        # end
      end
    elsif not $to_process.empty?
      # ($to_process.size - 1).times{ $to_process.shift }
      $to_process = [$to_process.last]
      # EM.add_timer(1){ update_page }
    end   # if free_procs > 0
  end

  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8091) do |ws|
    ws.onopen do
      # settings.socket = ws
      $socket = ws
      D.bg :in
      $to_process << Conversion.new(STDIN.read, Time.now)
      D.bg :in
      update_page
    end
    # ws.onclose do
      # @@socket.send 'ping'
    # end
  end

  Server.run!
  p 'l'
end   # module InstantMarkdown
end   # EM.run

D.bg :in
