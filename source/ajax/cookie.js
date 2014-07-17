(function (enyo, scope) {
	
	/**
	* Available additional attributes that can be set with a [cookie]{@glossary cookie}.
	*
	* @typedef {Object} enyo~CookieOptions
	* @property {String} path - The path that the cookie is relevant to, defaults to current
	*	[document.location]{@glossary document.location}.
	* @property {String} domain - The _host_ portion of the domain URI.
	* @property {String} max-age - The length of time the cookie is valid __in seconds__.
	* @property {String} expires - The date at which to expire the cookie, in GMTString format. If
	*	not specified will expire at the end of the session.
	* @property {Boolean} secure - Whether or not the cookie can be transferred over non-https
	*	connections. The default is `false`.
	* @public
	*/

	/**
	* Retrieves the given [cookie]{@glossary cookie} from
	* [document.cookie]{@glossary document.cookie}.
	*
	* @param {String} nom The name of the cookie to retrieve.
	* @returns {(String|undefined)} The [decoded]{@glossary decoreURIComponent} cookie or
	*	`undefined` if it could not be retrieved.
	* @public
	*/
	enyo.getCookie = function(nom) {
		var matches = document.cookie.match(new RegExp("(?:^|; )" + nom + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	};

	/**
	* Set a [cookie]{@glossary cookie} for the given name and value to
	* [document.cookie]{@glossary document.cookie}. Use the optional configuration
	* [hash]{@glossary Object} to specify the
	* [cookie properties]{@link enyo~CookieProperties}. You can remove a
	* [cookie]{@glossary cookie} using this method by setting its `Max-Age` value to `0`.
	*
	* Also note that if you are developing in Google Chrome with a local file as your application
	* it must be started with `--enable-file-cookies` (from the command line) to allow
	* [cookies]{@glossary cookie} to be set.
	*
	* @param {String} nom The name of the cookie.
	* @param {*} value The value to be [encoded]{@glossary encodeURIComponent} for storage.
	* @param {enyo~CookieProperties} [props] The optional configuration properties to apply to
	*	the cookie.
	* @public
	*/
	enyo.setCookie = function(nom, value, props) {
		var cookie = nom + "=" + encodeURIComponent(value);
		var p = props || {};
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
		var name, val;
		for (name in p){
			cookie += "; " + name;
			val = p[name];
			if (val !== true) {
				cookie += "=" + val;
			}
		}
		//
		//enyo.log(cookie);
		document.cookie = cookie;
	};

})(enyo, this);