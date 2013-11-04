(function (enyo) {
	//*@protected
	var normalize = function (url) {
		return url.replace(/([^:]\/)(\/+)/g, "$1");
	};
	var http = /^http/;
	var getLocation = function () {
		var u = location.protocol,
			p = location.pathname.split("/");
		u += ("//" + location.host);
		if (p.length > 1 && p[p.length-1].match(/\./)) { p.pop(); }
		u += ("/" + p.join("/"));
		return u;
	};
	//*@public
	/**
	*/
	enyo.kind({
		name: "enyo.XHRSource",
		kind: enyo.Source,
		/**
			Set this to the constructor for the _requestKind_.
		*/
		requestKind: null,
		/**
			For records that don't provide their own _urlRoot_, you may supply a
			default value instead of using the current location.
		*/
		urlRoot: "",
		/**
			Attempts to build a URL for the given record, according to the options, if
			necessary. If the _url_ property already exists on the options, it is used
			instead of the record's _url_ property or _getUrl()_ method.  This method
			also generates a _urlRoot_ if none is provided by the record.
		*/
		buildUrl: function (rec, opts) {
			// giving precedence to a _url_ in the options, check for a _getUrl_ method
			// and default back to the _records_ own _url_ property
			var u = opts.url || (enyo.isFunction(rec.getUrl) && rec.getUrl()) || rec.url;
			// if the protocol is missing we check first for the _urlRoot_ of the _record_,
			// then this _source_, and then default to the current location.origin property
			// TODO: this is crippling to use location this way, is there a safer alternative?
			if (!http.test(u)) {
				u = (rec.urlRoot || this.urlRoot || getLocation()) + "/" + u;
			}
			return normalize(u);
		},
		/**
			Executes the _requestKind_ with the given options. A _params_ hash will be
			used to generate a query string.
		*/
		go: function (opts) {
			var Kind = this.requestKind,
				o    = enyo.only(this._ajaxOptions, opts),
				xhr  = new Kind(o);
			xhr.response(function (xhr, res) {
				// we swap the ordering to preserve the signature of the
				// store while passing the xhr object if needed
				if (opts && opts.success) {
					opts.success(res, xhr);
				}
			});
			xhr.error(opts.fail);
			xhr.go(opts.params);
		},
		/**
			Overload this method for special implementations or needs. By default,
			a find merely turns the _attributes_ of the options into the _postBody_
			of a "POST" method request with the _url_ of the form _/find/[kind-name]_.
		*/
		find: function (ctor, opts) {
			var p  = ctor.prototype,
				kn = p.kindName,
				pb = opts.attributes,
				u  = "/find/" + kn;
			opts.url = u;
			opts.url = this.buildUrl(p, opts);
			opts.method = "POST";
			opts.postBody = pb;
			this.go(opts);
		},
		//*@protected
		_ajaxOptions: enyo.keys(enyo.AjaxProperties)
	});
	//*@public
	/**
		A generic source for use with an Ajax-ready backend. It uses the "GET"
		method for _fetch()_, "POST" or "PUT" for _commit()_ (depending on whether
		the record is _new_ (created locally), and "DELETE" for _destroy()_.
	*/
	enyo.kind({
		name: "enyo.AjaxSource",
		kind: enyo.XHRSource,
		//* Uses the _enyo.Ajax_ kind for requests
		requestKind: enyo.Ajax,
		//* Uses "GET" method.
		fetch: function (rec, opts) {
			opts.method = "GET";
			opts.url = this.buildUrl(rec, opts);
			this.go(opts);
		},
		//* Uses "POST" method if the record is new; otherwise, "PUT".
		commit: function (rec, opts) {
			opts.method = rec.isNew? "POST": "PUT";
			opts.url = this.buildUrl(rec, opts);
			opts.postBody = rec.toJSON();
			this.go(opts);
		},
		//* Uses "DELETE" method.
		destroy: function (rec, opts) {
			opts.method = "DELETE";
			opts.url = this.buildUrl(rec, opts);
			this.go(opts);
		}
	});
	/**
		A generic source for use with a JSONP-ready backend. It uses the "GET"
		method for _fetch()_, "POST" or "PUT" for _commit()_ depending on whether
		the record is _new_ (created locally), and "DELETE" for _destroy()_.
	*/
	enyo.kind({
		name: "enyo.JsonpSource",
		kind: enyo.XHRSource,
		//* Uses the _enyo.JsonpRequest_ kind for requests
		requestKind: enyo.JsonpRequest,
		//* Uses "GET" method.
		fetch: function (rec, opts) {
			opts.cacheBust = false;
			opts.method = "GET";
			opts.url = this.buildUrl(rec, opts);
			this.go(opts);
		},
		//* Uses "POST" method if the record is new; otherwise, "PUT".
		commit: function (rec, opts) {
			opts.cacheBust = false;
			opts.method = rec.isNew? "POST": "PUT";
			opts.url = this.buildUrl(rec, opts);
			opts.postBody = rec.toJSON();
			this.go(opts);
		},
		//* Uses "DELETE" method.
		destroy: function (rec, opts) {
			opts.cacheBust = false;
			opts.method = "DELETE";
			opts.url = this.buildUrl(rec, opts);
			this.go(opts);
		}
	});
})(enyo);