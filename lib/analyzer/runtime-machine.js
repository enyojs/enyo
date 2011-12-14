//
// implement loader 'machine':
// the machine implements the interface required by 'loader'
//
runtimeMachine = {
	_head: function(inType, inAttrs, inText) {
		this._inflight = true;
		var elt = document.createElement(inType);
		for (var n in inAttrs) {
			elt.setAttribute(n, inAttrs[n]);
		}
		if (inText) {
			elt.innerText = inText;
		}
		if (!this._headElt) {
			this._headElt = document.getElementsByTagName("head")[0];
		}
		this._headElt.appendChild(elt);
		return elt;
	},
	sheet: function(s) {
		this._head("link", {
			type: "text/css",
			media: "screen",
			rel: "stylesheet",
			href: s
		});
	},
	inject: function(inCode) {
		this._head("script", {type: "text/javascript"}, inCode);
	},
	_scripts: [],
	script: function(s) {
		if (this._inflight) {
			this._scripts.push(s);
		} else {
			this._script(s);
		}
	},
	_require: function(inScript) {
	},
	_script: function(inPath) {
		this._inflight = true;
		var elt = this._head("script", {
			type: "text/javascript",
			src: inPath
		});
		var self = this;
		elt.onload = function() {
			self._loaded(inPath);
		};
		elt.onerror = function() {
			self._error(inPath);
		};
	},
	_continue: function() {
		this._inflight = false;
		var script = this._scripts.pop();
		if (script) {
			this._script(script);
		}/* else {
			this._done();
		}*/
	},
	_loaded: function(inPath) {
		//console.log("loaded [" + inPath + "]");
		this._continue();
	},
	_error: function(inPath) {
		//console.log("error [" + inPath + "]");
		this._continue();
	}
};
