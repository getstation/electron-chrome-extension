
chrome.permissions.contains({
  origins: ['https://gml.email/*']
}, function (result) {
  if (result) {
    document.querySelector('#gml_permission').style = 'display:none;'
    window.open('https://gmelius.io/settings', '_blank')
  }
})

document.querySelector('#dashboard').addEventListener('click', function (event) {
  window.open('https://gmelius.io/settings', '_blank')
})
document.querySelector('#gml_permission').addEventListener('click', function (event) {
  chrome.permissions.request({
    origins: ['https://gml.email/*']
  }, function (granted) {
    window.open('https://gmelius.io/settings', '_blank')
  })
})
