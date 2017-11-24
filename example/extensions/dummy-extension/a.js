chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  details.requestHeaders['User-Agent'] = 'My Awesome Agent'

  return {
    cancel: false,
    requestHeaders: details.requestHeaders,
    statusLine: 'HTTP/1.1 200 OK'
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});

chrome.webRequest.onHeadersReceived.addListener(function(details) {
  details.responseHeaders.push({
    name: 'X-Test',
    value: ['ok']
  })

  return {
    cancel: false,
    responseHeaders: details.responseHeaders,
    statusLine: 'HTTP/1.1 200 OK'
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
}, ['blocking', 'responseHeaders']);

function reqListener () {
  console.log('--- XMLHttpRequest from extension')
  console.log(this.getAllResponseHeaders());
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListener);
oReq.open("GET", `http://motherfuckingwebsite.com/?foo=${Date.now()}`);
oReq.send();

console.log('I\' m injected')
var foo = "FOOOOO"
// throw new Error('Foo')

const imgURL = chrome.runtime.getURL('/ta_maman.png');

var body = document.querySelector('body')
var img = new Image();
img.src = imgURL;
body.appendChild(img);

console.log(chrome.runtime.getManifest())