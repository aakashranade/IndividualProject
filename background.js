chrome.browserAction.onClicked.addListener(onClicked);
function getData(){
  var data = [];
  let tags = document.getElementsByTagName('meta');
  for (element of tags) {
    data.push(element)
  }

  let scripts = document.getElementsByTagName('script');
  for (element of scripts) {

    data.push(element)
    
  }
  console.log("got data!");

}


function onClicked(){
  console.log("clicked!");
  chrome.runtime.sendMessage({
    subject: 'view-data',
    dataToSend: data
  })

}
