//document.addEventListener('DOMContentLoaded', function () {

const backgroundpage = chrome.extension.getBackgroundPage();
let metadata = backgroundpage.metadata;

console.log(metadata);
Object.keys(metadata).forEach(function (tag) {
  const div = document.createElement('div')
  div.textContent = `${tag}: ${metadata[tag]}`
  document.body.appendChild(div)
})

// var table = document.getElementById('metaTable');
//
// for (element of metadata) {
//    let tr = document.createElement('tr');
//    let td = document.createElement('td');
//
//    td.innerHTML = element;
//    tr.appendChild(td);
// }
//}, false)
