//* @protected
enyo.kind({
	name: "enyo.lexer.Base",
	constructor: function(inText) {
		if (inText) {
			this.start(inText);
		}
	},
	p0: 0,
	p: 0,
	ib: function() {
		return Boolean(this.m);
	},
	search: function(inRegEx) {
		var r = inRegEx.global ? inRegEx : new RegExp(inRegEx.source, "g");
		r.lastIndex = this.p;
		this.m = r.exec(this.s);
		// find a delimiter
		//   <token><delimeter>
		// p0<----->p
		this.p = this.m ? this.m.index: -1;
		// d is the first character of <delimeter>, if return value is true
		return this.ib() && (this.d = this.s.charAt(this.p));
	},
	lookahead: function(inChars) {
		return this.s.charAt(this.p + inChars);
	},
	getToken: function() {
		return this.s.slice(this.p0, this.p);
	},
	tokenize: function(inD) {
		this.p += inD || 0;
	},
	pushToken: function(inKind, inD, inAllowEmpty) {
		this.tokenize(inD);
		var token = this.getToken();
		if (!token && !inAllowEmpty) {
			return {};
		}
		var nLines = (token.match(/\n/g) || []).length;
		var mToken = { kind: inKind, token: token, start: this.p0, end: this.p, line: this.n, height: nLines };
		this.n += nLines;
		this.p0 = this.p;
		this.r.push(mToken);
		return mToken;
	},
	tossToken: function(inD) {
		this.tokenize(inD);
		this.p0 = this.p;
	},
	start: function(inS) {
		this.s = inS;
		this.l = this.s.length;
		this.r = [ ];
		this.d = '';
		this.p0 = 0;
		this.p = 0;
		this.n = 0;
		this.analyze();
		this.finish();
	},
	finish: function() {
		this.t += this.s;
		this.pushToken("gah");
	}
});

enyo.kind({
	name: "enyo.lexer.Code",
	kind:  enyo.lexer.Base,
	symbols: "(){}[];,:<>+-",
	operators: [ "++", "--", "+=", "-=", "==", "!=", "&&", "||", '"', "'", "=" ],
	keywords: [ "function", "new", "return", "if", "while", "do", "break", "continue", "switch", "case", "var" ],
	buildPattern: function() {
		// match an inline regex
		//var rregex = "/[^*/](?:\\/|[^/])+?/";
		// matches double-quoted string that may contain escaped double-quotes
		var rstring1 = '"(?:\\\\"|[^"])*?"';
		// matches single-quoted string that may contain escaped single-quotes
		var rstring2 = "'(?:\\\\'|[^'])*?'";
		// matches any of the keywords (\b only matches on word boundaries)
		var rkeys = '\\b(?:' + this.keywords.join('|') + ')\\b';
		// match symbols and operators (code here esacpes the symbol characters for use in regex)
		var rsymbols = '[\\' + this.symbols.split('').join('\\') + ']';
		var rops = [];
		for (var i=0, o; (o=this.operators[i]); i++) {
			rops.push('\\' + o.split('').join('\\'));
		}
		rops = rops.join('|');
		rsymbols += '|' + rops;
		// these are all the patterns to match
		var matches = [rstring1, rstring2, rkeys, '\\/\\/', '\\/\\*', /*rregex,*/ rsymbols, "'\"", '\\s'];
		// these are the matching methods corresponding to the patterns above
		this.matchers = ["doString", "doString", "doKeyword", "doLineComment", "doCComment", /*"doRegExp",*/ "doSymbol", "doLiteral", "doWhitespace"];
		// construct the master regex as a union of the patterns above
		this.pattern = '(' + matches.join(')|(') + ')';
	},
	analyze: function() {
		this.buildPattern();
		var regex = new RegExp(this.pattern, "gi");
		while (this.search(regex)) {
			this.pushToken("identifier");
			this.process(this.matchers);
			this.pushToken("identifier");
		}
	},
	process: function(inMatchers) {
		for (var i=0, f; (f=inMatchers[i]); i++)
			if (this.m[i+1]) {
				this[f].apply(this);
				return;
			}
		this.doSymbol();
	},
	doWhitespace: function() {
		this.tokenize(1);
		this.search(/\S/g);
		this.pushToken('ws');
	},
	doEscape: function() {
		this.tokenize(2);
	},
	doLiteral: function() {
		this.tossToken(1);
		var delim = this.d;
		var rx = new RegExp("\\" + delim + "|\\\\", "g");
		while (this.search(rx)) {
			switch (this.d) {
				case '\\':
					this.doEscape();
					break;
				default:
					this.pushToken('literal', 0, true).delimiter = delim;
					this.tossToken(1);
					return;
			}
		}
	},
	doSymbol: function() {
		this.pushToken('symbol', this.m[0].length);
	},
	doKeyword: function() {
		this.pushToken('keyword', this.m[0].length);
	},
	doLineComment: function() {
		this.tokenize(2);
		if (this.search(/[\r\n]/g)) {
			this.tokenize(0);
		}
		this.pushToken("comment");
	},
	doCComment: function() {
		this.tokenize(2);
		var n = 1;
		while ((n)&&(this.search(/\/\*|\*\//g))) {
			n += (this.d == '/' ? 1 : (this.d == '*' ? -1 : 0));
			this.tokenize(2);
		}
		this.pushToken("comment");
	},
	doString: function() {
		this.pushToken('string', this.m[0].length);
	}/*,
	doRegExp: function() {
		console.log(this.m[0]);
		this.pushToken('string', this.m[0].length);
	}*/
});

enyo.lexer.Js = enyo.lexer.Code
