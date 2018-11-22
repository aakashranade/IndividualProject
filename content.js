function getData(){
  var data = new Map();
  let tags = document.getElementsByTagName('meta');
  for (element of tags) {
    //console.log(element.attributes[0].name);
    if(element.attributes[0].name == "name" || element.attributes[0].name == "property" ){

      data.set(element.attributes[0].value, element.content)

    }
  }

  let scripts = document.getElementsByTagName('script');
  var i = 0;
  for (element of scripts) {
    if(element.type == "application/ld+json") {

      console.log(element.innerHTML);
      data.set(element.type + i, element.innerHTML)
      i++

    }
  }
  console.log(data);

}

getData();

//let tags = document.getElementsByTagName('meta');
//let scripts = document.getElementsByTagName('script');
//for (element of tags) {
//  console.log(element)
//}
//for (element of scripts) {
//  console.log(element)
//}
