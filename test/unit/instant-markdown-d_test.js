var project_root = '../../',
    subject   = require(project_root + 'lib/instant-markdown-d'),
    sinon     = require('sinon'),
    child_process = require('child_process'),
    chai = require('chai'),
    sandbox;
chai.use(require('sinon-chai'));
chai.should();

beforeEach(function(){ sandbox = sinon.sandbox.create(); });
afterEach(function(){ sandbox.restore(); });



describe('instant-markdown-d', function(){

  describe('.start', function(){
    var execStub;
    beforeEach(function(){
      execStub = sandbox.stub(child_process, 'exec', function(){});
    });

    it('opens a browser page to the listening address', function(){
      subject.start(8090, 'gfm');
      execStub.should.have.been.calledWith('open -g http://localhost:8090');
    });

    it('starts server listening on specified port', function(){
      var serverListenStub = sandbox.stub(require('http').Server.prototype, 'listen', function(){});
      subject.start(8090, 'gfm');
      serverListenStub.should.have.been.called;
    });
  });


  describe('.convert', function(){
    var converter,
        sock,
        converterRender,
        sockEmit;

    beforeEach(function(){
      converter = { render: function(){ return '<em>str</em>'; } };
      converterRender = sandbox.spy(converter, 'render');
      sock = { emit: function(){} };
      sockEmit = sandbox.spy(sock, 'emit');
    });

    it("sends converted markup as 'newContent' on the websocket", function(){
      subject.convert('*str*', converter, sock);
      sockEmit.should.have.been.calledWith('newContent', '<em>str</em>');
    });

    it("passes raw markup to converter#render", function(){
      subject.convert('*str*', converter, sock);
      converterRender.should.have.been.called;
    });
  });

});
