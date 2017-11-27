console.log('I\' m injected')
var foo = "FOOOOO"
// throw new Error('Foo')

const imgURL = chrome.runtime.getURL('/ta_maman.png');

var body = document.querySelector('body')
var img = new Image();
img.src = imgURL;
body.appendChild(img);

console.log(chrome.runtime.getManifest())