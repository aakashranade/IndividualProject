chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)) {
  switch (request.subject) {
    case 'view-data':
      window.open(chrome.runtime.getURL(index.html))

      break;
    default:

  }
}
