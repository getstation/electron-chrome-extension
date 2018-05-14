window.what = 'whatever'

fetch('https://gmelius.io/app/app.bundle.js#test').then(function(response) {
  console.log(response)
});