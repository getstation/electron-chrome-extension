// console.log(foo);
console.log(chrome.extension.getURL('/foo.png'))
chrome.storage.sync.set({foo: 'fioo'}, function (v) {console.log(v)})
chrome.storage.sync.get({foo: 'fioo'}, function (v) {console.log(v)})


// window.tamaman = 'tama'
