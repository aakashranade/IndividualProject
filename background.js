chrome.browserAction.onClicked.addListener( buttonClicked );

window.metadata = {};

/**
 * buttonClicked - description
 *
 * @param  {type} tab description
 * @return {type}     description
 */
function buttonClicked( tab ) {
   let message = {
      subject: "request-data"
   }
   chrome.tabs.sendMessage( tab.id, message );
}

chrome.runtime.onMessage.addListener( gotMessage );

/**
 * gotMessage - description
 *
 * @param  {type} request      description
 * @param  {type} sender       description
 * @param  {type} sendResponse description
 * @return {type}              description
 */
function gotMessage( request, sender, sendResponse ) {
   console.log( request )
   if ( request.subject === "PROV-data" ) {
      window.metadata = request.metadata
      chrome.tabs.create( {
         url: 'view/index.html'
      } )
   }
}