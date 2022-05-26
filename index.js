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

    let firefoxWarning =`
      <h1>Oops!</h1>
      <h3>Your browser doesn't allow windows to self-close. </h3>
      <h3>If you want the preview window to close automatically </h3>
      <ul>
        <li>in Firefox, go to about:config and set
        dom.allow_scripts_to_close_windows to true.</li>
        <li>in Qutebrowser (with old QtWebKit backend), go to :config-edit and
          set
          <a href='https://qutebrowser.org/doc/help/settings.html#content.javascript.can_close_tabs'>content.javascript.can_close_tabs</a>
        to true</li>
        <li>in Chromium derivatives it is not possible</li>
      </ul>
      <b>If it is OK to close the browser manually, then do so. Allowing scripts
      to close windows not opened by the script is considered a security
      risk.</b> `
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


function loadStyle(src) {
  return new Promise(function (resolve, reject) {
    let link = document.createElement('link');
    link.href = src;
    link.rel = 'stylesheet';

    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Style load error for ${src}`));

    document.head.append(link);
  });
}

function getUrlParameter(sParam){
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++){
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam)
    {
        return sParameterName[1];
    }
  }
}
