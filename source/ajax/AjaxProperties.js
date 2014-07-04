(function (enyo, scope) {

	/**
	* The available options used by {@link enyo.Ajax} and {@link enyo.WebService}.
	*
	* @namespace enyo.AjaxProperties
	* @public
	*/
	enyo.AjaxProperties = /** @lends enyo.AjaxProperties */ {
		
		/**
		* When true, appends a random number as a parameter for GET requests to try to force a new
		* fetch of the resource instead of reusing a local cache.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		cacheBust: true,
		
		/**
		* The URL for the service. This can be a relative URL if used to fetch resources bundled
		* with the application.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		url: '',
		
		/**
		* The HTTP method to use for the request, defaults to GET.  Supported values include 'GET',
		* 'POST', 'PUT', and 'DELETE'.
		*
		* @type {String}
		* @default 'GET'
		* @public
		*/
		method: 'GET', // {value: 'GET', options: ['GET', 'POST', 'PUT', 'DELETE']}
		
		/**
		* How the response will be handled. Supported values are: 'json', 'text', 'xml'.
		*
		* @type {String}
		* @default 'json'
		* @public
		*/
		handleAs: 'json', // {value: 'json', options: ['text', 'json', 'xml']}
		
		/**
		* The Content-Type header for the request as a String.
		*
		* @type {String}
		* @default 'application/x-www-form-urlencoded'
		* @public
		*/
		contentType: 'application/x-www-form-urlencoded',
		
		/**
		* If true, makes a synchronous (blocking) call, if supported.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		sync: false,
		
		/**
		* Optional additional request headers as a [hash]{@link external:Object} or `null`.
		
		* ```javascript
		* { 'X-My-Header': 'My Value', 'Mood': 'Happy' }
		* ```
		*
		* @type {Object}
		* @default null
		* @public
		*/
		headers: null,
		
		/**
		* The content for the request body for POST/PUT methods. When postBody is a
		* [buffer]{@link external:Buffer} or a [string]{@link external:String}, it is passed
		* verbatim in the request body. When it is a [hash]{@link external:Object}, the way it is
		* encoded depends on the contentType:
		*
		* - application/json => JSON.stringify
		* - application/x-www-urlencoed => url-encoded parameters
		* - multipart/form-data => passed as fields in enyo.FormData (XHR2 emulation)
		*
		* @type {(String|Buffer|Object)}
		* @default ''
		* @public
		*/
		postBody: '',
		
		/**
		* The optional user name to use for authentication purposes.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		username: '',
		
		/**
		* The optional password to use for authentication purposes.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		password: '',
		
		/**
		* Optional [hash]{@link external:Object} with fields to pass directly to the underlying XHR
		* object. One example is the _withCredentials_ flag used for cross-origin requests.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		xhrFields: null,
		
		/**
		* Optional [string]{@link external:String} to override the MIME-Type header.
		*
		* @type {String}
		* @default null
		* @public
		*/
		mimeType: null
	};

})(enyo, this);