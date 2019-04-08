chrome.runtime.onMessage.addListener( gotMessage );

/**
 * gotMessage - Listens for an event when the extension button is clicked.
 *              When clicked, gather all the metadata and send it to the background script.
 *
 * @param  {type} request      description
 * @param  {type} sender       description
 * @param  {type} sendResponse description
 */
function gotMessage( request, sender, sendResponse ) {
   if ( request.subject === "request-data" ) {
      console.log( "requested data!" );
      let message = {
         subject: "PROV-data",
         metadata: getData()
      }
      chrome.runtime.sendMessage( message )
   }
}

/**
 * getData - extract metadata from the DOM, filter it based on data required for ProvJS
 *           and return it
 *
 * @return {Object}  metadata that will be used to convert to PROV
 */
function getData() {
   var provData = {};
   var websiteData = {};
   var metaData = {
      '_count': {}
   };
   let tags = document.getElementsByTagName( 'meta' );
   for ( element of tags ) {

      if ( element.attributes[ 0 ].name == "name" || element.attributes[ 0 ].name == "property" ) {

         var id = ''
         if ( !( element.attributes[ 0 ].value in metaData[ '_count' ] ) ) {
            metaData[ '_count' ][ element.attributes[ 0 ].value ] = 0
         }
         if ( metaData[ '_count' ][ element.attributes[ 0 ].value ] > 0 ) {
            id = metaData[ '_count' ][ element.attributes[ 0 ].value ]
         }

         metaData[ element.attributes[ 0 ].value + id ] = element.content
         metaData[ '_count' ][ element.attributes[ 0 ].value ] += 1
      }
   }

   var jsonData = {};
   let scripts = document.getElementsByTagName( 'script' );
   for ( element of scripts ) {
      if ( element.type == "application/ld+json" ) {
         jsonData = {
            ...jsonData,
            ...JSON.parse( element.innerHTML ),
         };
      }
   }
   websiteData = {
      ...metaData,
      ...jsonData,
   }
   console.log( websiteData );

   provData[ 'domain' ] = {
      'url': document.domain
   };
   console.log( provData[ 'domain' ][ 'url' ] );
   provData[ 'author' ] = getAuthor( websiteData, metaData, jsonData );
   provData[ 'publisher' ] = getPublisher( websiteData );
   console.log( provData[ 'publisher' ] );
   provData[ 'article' ] = getArticleData( websiteData );
   return provData;
}



/**
 * getAuthor -  getAuthor - Extract the author data from the metadata; their name and url
 *
 * @param  {Object} websiteData
 * @param  {Object} metaData
 * @param  {Object} jsonData
 * @return {Object}             
 */
function getAuthor( websiteData, metaData, jsonData ) {
   var authors = [];
   //console.log("author");
   var numberOfAuthors = 0;
   if ( metaData[ '_count' ][ 'author' ] ) {
      numberOfAuthors = metaData[ '_count' ][ 'author' ];
   } else {
      numberOfAuthors = 1;
   }
   var authorArray = [];
   for ( var i = 0; i < numberOfAuthors; i++ ) {
      var id = ( i != 0 ) ? "author" + i : "author"
      authorArray.push( metaData[ id ] );
   }
   console.log( numberOfAuthors );


   for ( var i = 0; i < numberOfAuthors; i++ ) {
      var author = {}
      var authorId = ( i != 0 ) ? "author" + i : "author"
      //console.log("sdasd");
      if ( metaData.hasOwnProperty( authorId ) ) {
         author[ 'name' ] = metaData[ authorId ];
      } else if ( jsonData.hasOwnProperty( 'author' ) && jsonData[ 'author' ].hasOwnProperty( 'name' ) ) {
         author[ 'name' ] = jsonData[ 'author' ][ 'name' ];
      } else {
         author[ 'name' ] = '-';
      }

      if ( websiteData.hasOwnProperty( 'article:author' ) ) {
         if ( document.domain == "www.bbc.com" || document.domain == "www.bbc.co.uk" ) {
            author[ 'url' ] = websiteData[ 'article:author' ]
         } else if ( document.domain == "www.theguardian.com" ) {
            //console.log(metaData['article:author'])
            var authorUrl = websiteData[ 'article:author' ].split( "," )[ i ].split( document.domain + "/" )[ 1 ]
            author[ 'url' ] = authorUrl
         } else if ( websiteData[ 'article:author' ] ) {
            //console.log(metaData['article:author'])
            authorUrl = websiteData[ 'article:author' ].split( document.domain + "/" )[ 1 ]
            author[ 'url' ] = authorUrl
         }
         authors.push( author )
      } else {
         author[ 'url' ] = '-';
         authors.push( author )
      }
   }
   console.log( authors );
   return authors;
}

/**
 * getPublisher - Extract publisher data from metadata; their name
 *
 * @param  {Object} websiteData description
 * @return {Object}             description
 */
function getPublisher( websiteData ) {
   var publisher = {};
   if ( websiteData.hasOwnProperty( 'article:publisher' ) ) {
      publisher[ 'name' ] = websiteData[ 'article:publisher' ]
   } else if ( websiteData.hasOwnProperty( 'publisher' ) && websiteData[ 'publisher' ].hasOwnProperty( 'name' ) ) {
      publisher[ 'name' ] = websiteData[ 'publisher' ][ 'name' ];
   } else {
      publisher[ 'name' ] = "-"
   }

   console.log( publisher )
   return publisher;
}

/**
 * getArticleData - Extract article data from metadata, its url, time it was published and title
 *
 * @param  {Object} metaData
 * @param  {Object} jsonData
 * @return {Object}
 */
function getArticleData( websiteData ) {
   var article = {};
   article[ 'url' ] = document.URL.split( document.domain + "/" )[ 1 ];
   if ( websiteData.hasOwnProperty( 'article:published_time' ) ) {
      article[ 'publishedTime' ] = websiteData[ 'article:published_time' ];
   } else if ( websiteData.hasOwnProperty( 'datePublished' ) ) {
      article[ 'publishedTime' ] = websiteData[ 'datePublished' ];
   } else {
      article[ 'publishedTime' ] = '-';
   }

   article[ 'title' ] = websiteData[ 'og:title' ];
   console.log( article[ 'title' ] )
   return article;
}