'use strict';
let socket = io('http://'+ window.location.host +'/');

socket.on('connect', function () {
  setDisconnected(false);
  socket.on('newContent', function(newHTML) {
    document.querySelector(".markdown-body").innerHTML = newHTML;

    // scroll to the hyperlink with id="marker"
    let marker = document.getElementById("marker");
    if(marker) {
      marker.scrollIntoView();
    }
    mermaid.init()
  });
  socket.on('die', function(newHTML) {
    window.open('', '_self', '');
    window.close();

    let firefoxWarning =
    "<h1>Oops!</h1>" +
    "<h3>Firefox doesn't allow windows to self-close.</h3>" +
    "<h3>If you want the preview window to close automatically like in other browsers, go to about:config and set dom.allow_scripts_to_close_windows to true.</h3>"
    document.body.innerHTML = firefoxWarning;
  });
});

socket.on('disconnect', function() {
  setDisconnected(true);
});

try {
  console.log('Inspecting status of Content Security Policy');
  eval('// If CSP is active, then this is blocked');
} catch (e) {
  console.log(`
    Detected that the CSP was active (by the user's preference).
    Droping capabilities to prevent rendered markdown from executing scripts.
    If you trust the markdown content, set environment variable
    INSTANT_MARKDOWN_ALLOW_UNSAFE_CONTENT=1
  `)
  let meta = document.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', "script-src 'none';");
  document.head.appendChild(meta);
}

function setDisconnected(isDisconnected) {
  document.getElementById('con-error').style.display =
    isDisconnected ? 'block' : 'none';
}
