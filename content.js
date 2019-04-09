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
   var articleBody = [];
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

   var articleClassNames = [
     "content__article-body from-content-api js-article__body",
     "story-body__link-external"
   ]

   for ( var i = 0; i < articleClassNames.length; i++ ) {
      var articleLength = document.getElementsByClassName( articleClassNames[ i ] ).length;
      if ( articleLength != 0 ) {

         for ( var j = 0; j < articleLength; j++ ) {
            articleBody.push( document.getElementsByClassName( articleClassNames[ i ] )[ j ] );
         }
      }
   }



   websiteData = {
      ...metaData,
      ...jsonData,
   }


   provData[ 'domain' ] = {
      'url': document.domain
   };

   provData[ 'author' ] = getAuthor( websiteData, metaData, jsonData );
   provData[ 'publisher' ] = getPublisher( websiteData );
   provData[ 'article' ] = getArticleData( websiteData );
   provData[ 'links' ] = getLinks( articleBody )
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

   for ( var i = 0; i < numberOfAuthors; i++ ) {
      var author = {}
      var authorId = ( i != 0 ) ? "author" + i : "author"

      if ( metaData.hasOwnProperty( authorId ) ) {
         author[ 'name' ] = metaData[ authorId ];
      } else if ( jsonData.hasOwnProperty( 'author' ) && jsonData[ 'author' ].hasOwnProperty( 'name' ) ) {
         author[ 'name' ] = jsonData[ 'author' ][ 'name' ];
      } else {
         author[ 'name' ] = '-';
      }

      if ( websiteData.hasOwnProperty( 'article:author' ) ) {
         if ( document.domain == "www.bbc.com" || document.domain == "www.bbc.co.uk" || document.domain == "bbc.co.uk" ) {
            author[ 'url' ] = websiteData[ 'article:author' ]
         } else if ( document.domain == "www.theguardian.com" ) {
            var authorUrl = websiteData[ 'article:author' ].split( "," )[ i ].split( document.domain + "/" )[ 1 ]
            author[ 'url' ] = authorUrl
         } else if ( websiteData[ 'article:author' ] ) {
            authorUrl = websiteData[ 'article:author' ].split( document.domain + "/" )[ 1 ]
            author[ 'url' ] = authorUrl
         }
         authors.push( author )
      } else {
         author[ 'url' ] = '-';
         authors.push( author )
      }
   }
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
   article[ 'title' ] = websiteData[ 'og:title' ];
   if ( websiteData.hasOwnProperty( 'article:published_time' ) ) {
      article[ 'publishedTime' ] = websiteData[ 'article:published_time' ];
   } else if ( websiteData.hasOwnProperty( 'datePublished' ) ) {
      article[ 'publishedTime' ] = websiteData[ 'datePublished' ];
   } else {
      article[ 'publishedTime' ] = '-';
   }
   return article;
}

/**
 * getLinks - Extract links from the article body
 *
 * @param  {Array} articleBody
 * @return {Array}
 */
function getLinks( articleBody ) {
   var links = [];
   if ( document.domain === "www.theguardian.com" ) {
      var articleATags = articleBody[ 0 ].getElementsByTagName( 'a' );
      for ( aTagIndex in articleATags ) {
         var aTag = articleATags[ aTagIndex ];
         if ( aTag[ 'className' ] == 'u-underline' ) {
            links.push( {
               'hostname': aTag[ 'hostname' ],
               'pathname': aTag[ 'pathname' ]
            } );
         }
      }
   } else if ( document.domain === "www.bbc.co.uk" || document.domain === "bbc.co.uk" ) {
      for ( aTagIndex in articleBody ) {
         var aTag = articleBody[ aTagIndex ];
         if ( ( aTag[ 'className' ] == 'story-body__link-external' ) ) {
            links.push( {
               'hostname': aTag[ 'hostname' ],
               'pathname': aTag[ 'pathname' ]
            } );
         }
      }
   }
   return links;
}