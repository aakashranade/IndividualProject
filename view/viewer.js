//document.addEventListener('DOMContentLoaded', function () {

const backgroundpage = chrome.extension.getBackgroundPage();
let metadata = backgroundpage.metadata;
console.log( metadata );
//provDoc = {};

/**
 * displayProv - description
 *
 * @return {type}  description
 */
function displayProv() {
   //Namespaces
   var def = prov.setDefaultNamespace( "http://default.example.com/" );
   var ex = prov.addNamespace( "ex", "http://www.example.org/" );
   var dcterms = prov.addNamespace( "dcterms", "http://purl.org/dc/terms/" );
   var foaf = prov.addNamespace( "foaf", "http://xmlns.com/foaf/0.1/" );
   var domain = prov.addNamespace( "domain", "https://" + metadata[ 'domain' ][ 'url' ] + "/" );
   var fb = prov.addNamespace( "fb", "https://www.facebook.com/" );
   var https = prov.addNamespace( "https", "https://" )
   //var author = {};

   //Entity -- The news article
   var article = prov.entity( "domain:" + metadata[ 'article' ][ 'url' ] );
   article.attr( "dcterms:title", metadata[ 'article' ][ 'title' ] );
   //console.log()

   //Agent -- The organization that publishes the article
   prov.agent( "https:" + metadata[ 'domain' ][ 'url' ],
      [ "prov:type", prov.ns.Organization,
         "foaf:name", metadata[ 'publisher' ][ 'name' ]
      ] );

   /**
    *Agent -- The author of the article
    *BBC does not credit any author, instead the author is credited to their facebook account
    */
   // if (metadata['_count']['author'] > 1){
   //
   // }
   console.log( metadata[ 'domain' ][ 'url' ] );
   if ( metadata[ 'domain' ][ 'url' ] == "www.bbc.com" || metadata[ 'domain' ][ 'url' ] == "bbc.co.uk" ) {
      var author = prov.agent( "fb:bbcnews" )
      prov.actedOnBehalfOf( "fb:bbcnews", "https:" + metadata[ 'domain' ][ 'url' ] );

      prov.wasAttributedTo( "domain:" + metadata[ 'article' ][ 'url' ], "fb:bbcnews" );
      author.attr( "prov:type", prov.ns.Person )
         .attr( "foaf:givenName", metadata[ 'author' ][ 'name' ] )

   } else if ( metadata[ 'domain' ][ 'url' ] == "www.theguardian.com" ) {
      var numberOfAuthors = metadata[ 'author' ].length;
      for ( var i = 0; i < numberOfAuthors; i++ ) {
         var author = prov.agent( "domain:" + metadata[ 'author' ][ i ][ 'url' ] );
         prov.actedOnBehalfOf( "domain:" + metadata[ 'author' ][ i ][ 'url' ], "https:" + metadata[ 'domain' ][ 'url' ] );
         prov.wasAttributedTo( "domain:" + metadata[ 'article' ][ 'url' ], "domain:" + metadata[ 'author' ][ i ][ 'url' ] );
         author.attr( "prov:type", prov.ns.Person )
            .attr( "foaf:givenName", metadata[ 'author' ][ i ][ 'name' ] )

      }
   } else {
      var author = prov.agent( "domain:" + metadata[ 'author' ][ 0 ][ 'url' ] );
      prov.actedOnBehalfOf( "domain:" + metadata[ 'author' ][ 0 ][ 'url' ], "https:" + metadata[ 'domain' ][ 'url' ] );
      prov.wasAttributedTo( "domain:" + metadata[ 'article' ][ 'url' ], "domain:" + metadata[ 'author' ][ 0 ][ 'url' ] );
      author.attr( "prov:type", prov.ns.Person )
         .attr( "foaf:givenName", metadata[ 'author' ][ 0 ][ 'name' ] )

   }

   //Activities and roles
   var publish1 = prov.activity( "ex:publish1" );
   var write1 = prov.activity( "ex:write1" );

   prov.wasGeneratedBy( "domain:" + metadata[ 'article' ][ 'url' ], "ex:write1" );
   prov.wasGeneratedBy( "domain:" + metadata[ 'article' ][ 'url' ], "ex:publish1", metadata[ 'article' ][ 'publishedTime' ] );
   console.log( metadata[ 'article' ][ 'publishedTime' ] );
   show_doc_json( prov.scope );
   //submitToProvStore(prov.scope);
}

function show_doc_json( doc ) {
   var provjson = doc.getProvJSON();
   document.getElementById( "provdata" ).innerHTML = JSON.stringify( provjson, null, " " );

}

displayProv();

/**
 * submitToProvStore - description
 *
 * @param  {type} doc description
 * @return {type}     description
 */
function submitToProvStore( doc ) {
   var api = new $.provStoreApi( {
      username: "aakash",
      key: "b6e2c89ab20fed5253d7f5aca62845c4e14be710"
   } );

   console.log( "inside submit" + doc )
   var provjson = doc.getProvJSON();
   api.submitDocument( "primer-test", provjson, false,
      function( new_document_id ) {
         //loadFromProvStore((new_document_id));
         console.log( new_document_id );
      },
      function( error ) {
         console.error( error );
      }
   );
}

// console.log("line59" + provDoc )
// document.addEventListener('DOMContentLoaded', function () {
//    document.querySelector('button').addEventListener('click', submitToProvStore(prov.scope));
// });