//chrome.runtime.onMessage.addListener(gotMessage);

//function gotMessage(request, sender, sendResponse){
  // console.log(request);
  // console.log(sender);
  // console.log(sendResponse);
  // if(request.subject === "request-data"){
  //   console.log("requested data!");
      var data = getData();
      // console.log(data);
      // let message = {
      //   subject: "view-data",
      //   metadata: data
      // }
    //sendResponse({message});
    chrome.runtime.sendMessage(data);
//  }
//  return true;
    //alert("na na na na, I'm FATMAN!");
    //let metadata = JSON.stringify(getData());
    //document.body.innerHTML = metadata;
  //window.open("file:view/index.html")
  //}

function getData(){
  var data = {};
  let tags = document.getElementsByTagName('meta');
  for (element of tags) {
    //console.log(element.attributes[0].name);
    if(element.attributes[0].name == "name" || element.attributes[0].name == "property" ){

      data[element.attributes[0].value] = element.content

    }
  }

  let scripts = document.getElementsByTagName('script');
  var i = 0;
  for (element of scripts) {
    if(element.type == "application/ld+json") {

      //console.log(element.innerHTML);
      data[element.type + i] = element.innerHTML
      i++

    }
  }
  //console.log(data);
  return data;
}


//getData();

//let tags = document.getElementsByTagName('meta');
//let scripts = document.getElementsByTagName('script');
//for (element of tags) {
//  console.log(element)
//}
//for (element of scripts) {
//  console.log(element)
//}
