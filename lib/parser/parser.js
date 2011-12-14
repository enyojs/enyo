//* @protected
enyo.kind({
	name: "enyo.parser.Base", 
	i: 0,
	constructor: function(inTokens) {
		this.a = [];
		this.html = [];
		this.lastToken = {};
		this.nodes = inTokens && this.parse(inTokens);
	},
	next: function() {
		return this.tokens[this.i++];
	},
	setTokens: function(inTokens) {
		this.i = 0;
		this.tokens = inTokens;
	},
	pushToken: function(inT) {
		this.a.push(inT);
	},
	parse: function(inLexer) {
		this.setTokens(inLexer.r);
		var tokens = this.processTokens();
		// make a fake sentinel node
		var sentinel = {children:[]};
		for (var i = 0, t; t = tokens[i]; i++) {
			t.index = i;
			t.parent = sentinel;
			sentinel.children.push(t);
		}
		return tokens;
	}
});

enyo.kind({
	name: "enyo.parser.Code",
	kind: enyo.parser.Base,
	pushNode: function(inCode, inKind, inToken, inDelim) {
		var token = this.a.map(function(t){ return t.token }).join('');
		token += (inToken ? inToken.token : '') + (inDelim||'');
		if (arguments.length > 2) {
			this.a.push(inToken);
		}
		var start, end, line, height;
		if (inToken) {
			start = inToken.start;
			end = inToken.end;
			line = inToken.line;
			height = inToken.height;
		} else if (this.a.length) {
			var first = this.a[0], last = this.a[this.a.length - 1];
			start = first.start;
			end = last.end;
			line = first.line;
			height = last.line - first.line;
		} else { // this.identifier was called to end a block/array/arg list/association, is 1 character token
			var curTok = this.tokens[this.i - 1];
			start = curTok.start;
			end = curTok.end;
			line = curTok.line;
			height = curTok.height;
		}
		var node = { kind: inKind, tokens: this.a, token: token, start: start, end: end, line: line, height: height };
		inCode.push(node);
		this.a = [];
		return node
	},
	identifier: function(inCode) {
		if (this.a.length) {
			this.pushNode(inCode, 'identifier');
		}
		return inCode;
	},
	findChildren: function(inNode) {
		var children = this.processTokens();
		// attach a parent pointer to each child
		for (var i = 0, c; c = children[i]; i++) {
			c.parent = inNode;
			c.index = i;
		}
		// update node with correct end/height
		inNode.children = children;
		inNode.end = this.lastToken.end;
		inNode.height = this.lastToken.line - inNode.line;
	},
	processArray: function(inCode, inToken) {
		this.identifier(inCode);
		this.findChildren(this.pushNode(inCode, 'array'));
	},
	processBlock: function(inCode, inToken) {
		this.identifier(inCode);
		this.findChildren(this.pushNode(inCode, 'block'));
	},
	processArguments: function(inCode, inToken) {
		this.identifier(inCode);
		var kind = 'association';
		if (this.lastToken.kind == "identifier" || this.lastToken.token == "function") {
			kind = 'argument-list';
		}
		this.findChildren(this.pushNode(inCode, kind));
	},
	processTokens: function(inKind) {
		var mt, t, code = [];
		while (mt = this.next()) {
			t = mt.token;
			//
			if (mt.kind == "ws") {
				continue;
			}
			else if (mt.kind == "literal")
				this.pushNode(code, mt.kind, mt, mt.delimiter);
			else if (mt.kind == "string")
				this.pushNode(code, mt.kind, mt);
			else if (mt.kind == "comment" || mt.kind=="keyword") {
				this.identifier(code);
				this.pushNode(code, mt.kind, mt);
			}
			//
			else if (t == '=' || t == ':') { 
				this.identifier(code);
				this.pushNode(code, "assignment", mt);
			}
			//
			else if (t == ';' || t == ',')
				this.identifier(code);
			//
			else if (t == '[')
				this.processArray(code, mt);
			else if (t == ']') {
				this.lastToken = mt;
				return this.identifier(code);
			}
			//
			else if (t == '{')
				this.processBlock(code, mt);
			else if (t == '}') {
				this.lastToken = mt;
				return this.identifier(code);
			}
			//
			else if (t == '(') 
				this.processArguments(code, mt);
			else if (t == ')') {
				this.lastToken = mt;
				return this.identifier(code);
			}
			//
			else this.pushToken(mt);
			this.lastToken = mt;
		}
		return code;
	}
});

enyo.kind({
	name: "enyo.parser.Text",
	kind: enyo.parser.Base,
	pushLine: function(inT) {
		(arguments.length)&&(this.a.push(inT));
		this.html.push('<span>', this.a.join("&middot;"), "</span><br />");
		this.a = [ ];
	},
	processParams: function(inToken) {
		if (this.lastToken.kind != "symbol")
			this.pushToken("[arguments|params]")
		else
			this.pushToken("[ternary op]")
		this.pushToken(inToken);
		this.processTokens();
	},
	processTokens: function() {
		var mt, t;
		while (mt = this.next()) {
			t = mt.token;
			if (mt.kind == "ws")
				continue;
			else if (t == ";")
				this.pushLine(t);
			else if (t == '{')
				this.pushLine(t + "<blockquote>");
			else if (t == '}')
				this.pushLine("</blockquote>" + t);
			else if (t == '(')
				this.processParams(t);
			else if (t == ')') {
				this.pushToken(t);
				return;
			} else this.pushToken(t);
			this.lastToken = mt;
		}
		return this.html.join("");
	}
});

enyo.parser.Js = enyo.parser.Code;
