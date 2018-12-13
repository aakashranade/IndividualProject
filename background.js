chrome.browserAction.onClicked.addListener(buttonClicked);

window.metadata = {};
function buttonClicked(tab){
  console.log("clicked!");
  console.log(window.metadata);
  // let message = {
  //   subject: "request-data"
  // }
  // chrome.tabs.sendMessage(tab.id, message);
  chrome.tabs.create({url: 'view/index.html'})

}

chrome.runtime.onMessage.addListener(gotMessage);
function gotMessage(request, sender, sendResponse){
  // if (request.subject === "view-data") {
    window.metadata = request
  // }
}
