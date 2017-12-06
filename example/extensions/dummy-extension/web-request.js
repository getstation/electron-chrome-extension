// Try it with motherfuckingwebsite.com

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  // Fires when a request is about to occur.
  // This event is sent before any TCP connection is made and can be used to cancel or redirect requests.
  console.log('--- onBeforeRequest details')
  console.log(details)
  return {
    cancel: details.url.indexOf("://evil.com/") !== -1
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});


chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  // Fires when a request is about to occur and the initial headers have been prepared.
  // The event is intended to allow extensions to add, modify, and delete request headers (*).
  // The onBeforeSendHeaders event is passed to all subscribers, so different subscribers may attempt to modify the request;
  // see the Implementation details section for how this is handled. This event can be used to cancel the request.
  details.requestHeaders['User-Agent'] = 'My Awesome Agent added onBeforeSendHeaders'
  console.log('--- onBeforeSendHeaders details')
  console.log(details)
  return {
    cancel: false,
    requestHeaders: details.requestHeaders,
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});

chrome.webRequest.onSendHeaders.addListener(function(details) {
  // Fires after all extensions have had a chance to modify the request headers, and presents the final (*) version.
  // The event is triggered before the headers are sent to the network. This event is informational and handled asynchronously.
  // It does not allow modifying or cancelling the request.
  console.log('--- onSendHeaders details')
  console.log(details)
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});

chrome.webRequest.onHeadersReceived.addListener(function(details) {
  // Fired when HTTP response headers of a request have been received.
  details.responseHeaders.push({
    name: 'X-onHeadersReceived',
    value: 'ok'
  });

  return {
    cancel: false,
    responseHeaders: details.responseHeaders,
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});
//
// chrome.webRequest.onAuthRequired.addListener(function(details) {
//   // not available in electron. We have to implement it.
// }, {
//   urls: ['<all_urls>'],
//   types: ['main_frame']
// });

chrome.webRequest.onBeforeRedirect.addListener(function(details) {
  // Fires when a redirect is about to be executed. A redirection can be triggered by an HTTP response code or by an extension.
  // This event is informational and handled asynchronously.
  // It does not allow you to modify or cancel the request.
  console.log('--- onBeforeRedirect details')
  console.log(details)
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});


chrome.webRequest.onResponseStarted.addListener(function(details) {
  // Fires when the first byte of the response body is received.
  // For HTTP requests, this means that the status line and response headers are available.
  // This event is informational and handled asynchronously.
  // It does not allow modifying or cancelling the request.
  console.log('--- onResponseStarted details')
  console.log(details)
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});

chrome.webRequest.onCompleted.addListener(function(details) {
  // Fires when a request has been processed successfully.
  console.log('--- onCompleted details')
  console.log(details)
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});

chrome.webRequest.onErrorOccurred.addListener(function(details) {
  // Fires when a request could not be processed successfully.
  console.log('--- onErrorOccurred details')
  console.log(details)
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
});

const sampleRequest = new XMLHttpRequest();
sampleRequest.addEventListener('load', function () {
  console.log('--- sampleRequest AllResponseHeaders');
  console.log(this.getAllResponseHeaders());
});
sampleRequest.open('GET', `http://motherfuckingwebsite.com/?foo=${Date.now()}`);
sampleRequest.send();

chrome.webRequest.handlerBehaviorChanged()
  .then((onFlushed, onError) =>(
    console.log('onFlushed')
  ));