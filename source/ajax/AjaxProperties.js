enyo.AjaxProperties = {
	/**
		When true, appends a random number as a parameter for GET requests
		to try to force a new fetch of the resource instead of reusing a local cache.
	*/
	cacheBust: true,
	/**
		The URL for the service.  This can be a relative URL if used to fetch resources bundled with the application.
	*/
	url: "",
	/**
		The HTTP method to use for the request, defaults to GET.  Supported values include
		"GET", "POST", "PUT", and "DELETE".
	*/
	method: "GET", // {value: "GET", options: ["GET", "POST", "PUT", "DELETE"]},
	/**
		How the response will be handled.
		Supported values are: <code>"json", "text", "xml"</code>
	*/
	handleAs: "json", // {value: "json", options: ["text", "json", "xml"]},
	/**
		The Content-Type header for the request as a String.
	*/
	contentType: "application/x-www-form-urlencoded",
	/**
		If true, makes a synchronous (blocking) call, if supported.  Synchronous requests
		are not supported on HP webOS.
	*/
	sync: false,
	/**
		Optional additional request headers as a JS object, e.g.
		<code>{ "X-My-Header": "My Value", "Mood": "Happy" }</code> or null.
	*/
	headers: null,
	/**
		The content for the request body for POST method.  If this is not set, params will be used instead.
	*/
	postBody: "",
	/**
		The optional user name to use for authentication purposes.
	*/
	username: "",
	/**
		The optional password to use for authentication purposes.
	*/
	password: "",
	/**
		Optional object with fields to pass directly to the underlying XHR object.
	*/
	xhrFields: null
};
