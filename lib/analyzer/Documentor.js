//* Translator converts parser output into a collection of documentation objects suitable for formatting.
enyo.kind({
	name: "enyo.Documentor",
	// matches "/** [multi-line comment] */" and "//* single line comment"
	commentRx: /\/\*\*([\s\S]*)\*\/|\/\/\*(.*)/m,
	constructor: function (inSource) {
		this.translate(new enyo.parser.Js(new enyo.lexer.Js(inSource)));
	},
	translate: function(inParser) {
		this.results = this.translateNodes(inParser.nodes);
	},
	translateNodes: function (inNodes, inResult) {
		//console.log("initializing public group");
		var group = "public";
		var result = inResult || {objects: []};
		for (var i = 0, comment = [], n; (n = inNodes[i]); i++) {
			switch (n.kind) {
				case 'association':
					// is this a closure?
					var nodes = n.children;
					if (nodes.length==3 && nodes[0].token == "function" && nodes[2].kind == "block") {
						// document the closure body as if it were top level
						this.translateNodes(nodes[2].children, result);
					}
					break;
				case 'identifier':
					if (inNodes[i+1] && inNodes[i+1].kind == "assignment") {
						i++;
						if (inNodes[++i].kind=="block") {
							result.objects.push(this.makeObject(n.token, inNodes[i].children, comment, group));
							comment = [];
						} else if (inNodes[i].token=="function") {
							result.objects.push(this.makeFunction(n.token, inNodes[i+1], comment, group));
							comment = [];
						}
					} else if (n.token=="enyo.kind") {
						result.objects.push(this.makeKind(inNodes[++i].children, comment, group));
						comment = [];
					}
					break;
				case 'comment':
					//console.log(n.token);
					var m = n.token.match(this.commentRx);
					if (m) {
						m = m[1] ? m[1] : m[2]; // + "\n";
						var p = this.extractPragmas(m);
						// need to avoid pushing empty strings if they are the result of removing pragmas,
						// so extractPragmas returns null in this case
						if (p.result != null) {
							comment.push(p.result);
						}
						group = p.group || group;
					}
					/*
					if (m) {
						comment.push(m[1] ? m[1] : m[2] + "\n");
					}
					*/
				default:
					break;
			}
		}
		if (comment.length) {
			result.comment = comment.join(" ");
			//console.log(result.comment);
			comment = [];
		}
		return result;
	},
	makeFunction: function(inName, inArgs, inComment, inGroup) {
		return {
			type: 'function',
			comment: inComment.join(' '),
			group: inGroup,
			name: inName,
			args: this.composeAssociation(inArgs)
		};
	},
	makeKind: function(inNodes, inComment, inGroup) {
		var o = this.makeThing('kind', inNodes[0].children, inComment, inGroup);
		//
		var map = o.properties.map, names = o.properties.names;
		var promote = function (name, newName) {
			var p = map[name];
			if (p) {
				if (typeof p.value == "string") {
					p.value = stripQuotes(p.value);
				}
				o[newName || name] = p;
			}
			delete map[name];
			for (var i = 0, n; n = names[i]; i++) {
				if (n == name) {
					names.splice(i, 1);
					break;
				}
			}
		}
		promote("name");
		promote(map.isa ? "isa" : "kind", "kind");
		promote("published");
		promote("events");
		//
		delete map.chrome;
		delete map.components;
		//
		return o;
	},
	makeObject: function(inName, inNodes, inComment, inGroup) {
		var o = this.makeThing('object', inNodes, inComment, inGroup);
		o.name = inName;
		return o;
	},
	makeThing: function (inType, inNodes, inComment, inGroup) {
		var obj = this.parseProperties(name, inNodes);
		obj.type = inType;
		obj.comment = inComment.join(' ');
		obj.group = inGroup;
		return obj;
	},
	extractPragmas: function(inString) {
		var pragmaRx = /^[*\s]*@[\S\s]*/g;
		var groups = {protected: 1, public: 1}, group;
		var pragmas = [];
		var s = inString;
		if (s.length) {
			s = inString.replace(pragmaRx, function(m) {
				var p = m.slice(2);
				//console.log("found pragma: [" + p + "]");
				pragmas.push(p);
				if (groups[p]) {
					//console.log(p);
					group = p;
				}
				return "";
			});
			// if removing pragmas has left this block empty
			// then we should return 'no string' as opposed
			// to 'empty string'
			if (!s.length) {
				s = null;
			}
		}
		return {result: s, pragmas: pragmas, group: group};
	},
	parseProperties: function (inClass, inProps) {
		var props = { names: [], map: {} };
		var methods = { names: [], map: {} };
		var result = { properties: props, methods: methods };
		//
		if (!inProps) {
			return result;
		}
		//
		var group = 'public';
		var comment = [];
		//
		// iterate through object
		for (var i = 0, p, pt; (p = inProps[i]); i++) {
			// if we have a comment then establish the method group or push the ($) comment
			if (p.kind == 'comment') {
				var m = p.token.match(this.commentRx);
				if (m) {
					m = m[1] || m[2];
					var p = this.extractPragmas(m);
					// need to avoid pushing empty strings if they
					// are the result of removing pragmas, so extract
					// pragma returns null in this case
					if (p.result != null) {
						comment.push(p.result);
					}
					group = p.group || group;
				}
			}
			// otherwise grab the property: (method or value)
			else {
				var name = p.token;
				// jump ":"
				i++;
				var nextP = inProps[++i];
				// do we have a method?
				if (nextP && nextP.token == 'function') {
					methods.names.push(name);
					methods.map[name] = {
						name: name,
						args: this.composeAssociation(inProps[++i]),
						comment: comment.join(' '),
						group: group
					};
					// function body is also part of this declaration
					i++;

					// otherwise, we have a simple property
				} else {
					var o = {
						name: name,
						//value: t[1],
						comment: comment.join(' '),
						group: group
					};
					if (nextP && nextP.kind == 'block') {
						o.value = this.parseProperties(inClass, nextP.children);
					} else if (nextP && nextP.kind == 'array') {
						o.value = "[]";
					} else {
						o.value = nextP && nextP.token;
						nextP = inProps[i+1];
						if (nextP && nextP.kind == "argument-list") {
							i++;
							o.value += "(" + this.composeAssociation(nextP) + ")";
						}
					}
					props.names.push(name);
					props.map[name] = o;
					//console.log(o.name, o);
				}
				comment = [];
			}
		}
		return result;
	},
	composeAssociation: function (inNode) {
		if (inNode.children) {
			var e = [];
			for (var i = 0, n; (n = inNode.children[i]); i++)
				if (n.kind != 'comment') {
					e.push(n.token);
				}
			return e.join(', ');
		}
		return inNode.token;
	}
	/*,
	getGroups: function (inParsed) {
		function sortFunc(a, b) {
			return (a.name > b.name ? 1 : -1);
		}
		//
		function processGroups(inProperties, inPropMethod) {
			for (var i = 0, g = null, p; (p = inProperties[i]); i++) {
				if (g != p.group && !(p.group in inPropMethod))
					inPropMethod[p.group] = [];
				inPropMethod[p.group].push(p);
				g = p.group;
			}
			// alpha sort on name
			for (var i in inPropMethod)
				inPropMethod[i].sort(sortFunc);
		}
		//
		function processType(inType) {
			for (var i = 0, c, groups; (c = inType[i]); i++) {
				groups = c.properties.groups = { props: {}, methods: {} };
				processGroups(c.properties.props, groups.props);
				processGroups(c.properties.methods, groups.methods);
			}
		}
		//
		processType(inParsed.classes);
		processType(inParsed.widgets);
	}
	*/
})

stripQuotes = function(inString) {
	var c0 = inString.charAt(0);
	if (c0 == '"' || c0 == "'") {
		inString = inString.substring(1);
	}
	var l = inString.length - 1, cl = inString.charAt(l);
	if (cl == '"' || cl == "'") {
		inString = inString.substr(0, l);
	}
	return inString;
};