const backgroundpage = chrome.extension.getBackgroundPage();
let metadata = backgroundpage.metadata;

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

   var domainUrl = metadata[ 'domain' ][ 'url' ];
   var articleUrl = metadata[ 'article' ][ 'url' ];
   var articleTitle = metadata[ 'article' ][ 'title' ];

   //Entity -- The news article
   var article = prov.entity( "domain:" + articleUrl );
   article.attr( "dcterms:title", articleTitle );

   //Agent -- The organization that publishes the article
   prov.agent( "https:" + domainUrl,
      [ "prov:type", prov.ns.Organization,
         "foaf:name", metadata[ 'publisher' ][ 'name' ]
      ] );

   /**
    *Agent -- The author of the article
    *BBC does not credit any author, instead the author is credited to their facebook account
    */
   if ( domainUrl == "www.bbc.com" || domainUrl == "www.bbc.co.uk" || domainUrl == "bbc.co.uk" ) {
      var author = prov.agent( "fb:bbcnews" )
      prov.actedOnBehalfOf( "fb:bbcnews", "https:" + domainUrl );
      prov.wasAttributedTo( "domain:" + articleUrl, "fb:bbcnews" );
      author.attr( "prov:type", prov.ns.Person )
         .attr( "foaf:givenName", metadata[ 'author' ][ 'name' ] )

   } else if ( domainUrl == "www.theguardian.com" ) {
      var numberOfAuthors = metadata[ 'author' ].length;
      for ( var i = 0; i < numberOfAuthors; i++ ) {
         var authorUrl = metadata[ 'author' ][ i ][ 'url' ];
         var author = prov.agent( "domain:" + authorUrl );
         prov.actedOnBehalfOf( "domain:" + authorUrl, "https:" + domainUrl );
         prov.wasAttributedTo( "domain:" + articleUrl, "domain:" + authorUrl );
         author.attr( "prov:type", prov.ns.Person )
            .attr( "foaf:givenName", metadata[ 'author' ][ i ][ 'name' ] )

      }
   } else {
      var authorUrl = metadata[ 'author' ][ 0 ][ 'url' ];
      var author = prov.agent( "domain:" + authorUrl );
      prov.actedOnBehalfOf( "domain:" + authorUrl, "https:" + domainUrl );
      prov.wasAttributedTo( "domain:" + articleUrl, "domain:" + authorUrl );
      author.attr( "prov:type", prov.ns.Person )
         .attr( "foaf:givenName", metadata[ 'author' ][ 0 ][ 'name' ] )

   }

   //Activities and relations
   var publish1 = prov.activity( "ex:publish1" );
   prov.wasGeneratedBy( "domain:" + articleUrl, "ex:publish1", metadata[ 'article' ][ 'publishedTime' ] );

   //Relations of the links inside the article body
   var numberOfLinks = metadata[ 'links' ].length;
   for ( var i = 0; i < numberOfLinks; i++ ) {
      var hostName = metadata[ 'links' ][ i ][ 'hostname' ];
      var pathName = metadata[ 'links' ][ i ][ 'pathname' ];
      if ( hostName == domainUrl || hostName == "www.bbc.co.uk" || hostName == "bbc.co.uk" ) {
         prov.wasInfluencedBy( "domain" + articleUrl, "domain:" + pathName )
      } else {
         prov.addNamespace( "link" + i, "https://" + hostName );
         var link = "link" + i + ":";
         prov.wasInfluencedBy( "domain" + articleUrl, link + pathName )
      }
   }
   show_doc_json( prov.scope );
}

function show_doc_json( doc ) {
   var provjson = doc.getProvJSON();
   document.getElementById( "provdata" ).innerHTML = JSON.stringify( provjson, null, " " );

}

displayProv();

/**
 * submitToProvStore - Submits the PROV document to the PROVStore and if successful open the document in a new window
 * @param  {type} doc description
 * @return {type}     description
 */
function submitToProvStore( doc ) {
   var api = new $.provStoreApi( {
      username: "username",
      key: "key"
   } );
   var provjson = doc.getProvJSON();
   api.submitDocument( "primer-test", provjson, true,
      function( new_document_id ) {
         if ( new_document_id ) {
            chrome.tabs.create( {
               url: 'https://openprovenance.org/store/documents/' + new_document_id
            } )
         }
      },
      function( error ) {
         console.error( error );
      }
   );
}

document.getElementById( 'submit' ).addEventListener( 'click', () => submitToProvStore( prov.scope ) );