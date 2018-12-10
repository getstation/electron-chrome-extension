console.log('I\' m injected')
var foo = "FOOOOO"
// throw new Error('Foo')

const imgURL = chrome.runtime.getURL('/ta_maman.png');

window.what = 'whatever'
console.log(window.what)
console.log(document)
var body = document.querySelector('body')
console.log(body)
var img = new Image();
img.src = imgURL;
// body.appendChild(img);

console.log(chrome.runtime.getManifest())

setTimeout(function() {console.log('block 5000')}, 5000)

window.onload = function() {
  console.log('onload')
  var body = document.querySelector('body')
  console.log(body)
};