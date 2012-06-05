//* @public

/**
	Gets a named value from the document cookie.
*/
enyo.getCookie = function(inName) {
	var matches = document.cookie.match(new RegExp("(?:^|; )" + inName + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
	Sets a named value in the document cookie, with properties.

	Properties in the optional _inProps_ argument are attached to the cookie.
	_inProps_ may have an _expires_ property, which can be a number of days, a
	Date object, or a UTC time string.
	
	To remove a cookie, use an _inProps_ value of <code>{ "Max-Age": 0 }</code>.
	
	If developing in the Google Chrome browser with a local file as your
	application, start Chrome with the <code>--enable-file-cookies</code> switch
	to allow cookies to be set.
*/
enyo.setCookie = function(inName, inValue, inProps) {
	var cookie = inName + "=" + encodeURIComponent(inValue);
	var p = inProps || {};
	//
	// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
	var exp = p.expires;
	if (typeof exp == "number") {
		var d = new Date();
		d.setTime(d.getTime() + exp*24*60*60*1000);
		exp = d;
	}
	if (exp && exp.toUTCString) {
		p.expires = exp.toUTCString();
	}
	//
	var name, value;
	for (name in p){
		cookie += "; " + name;
		value = p[name];
		if (value !== true) {
			cookie += "=" + value;
		}
	}
	//
	//console.log(cookie);
	document.cookie = cookie;
};
