enyo.kind({
	name: "Formatter",
	kind: "Component",
	statics: {
		showdown: new Showdown.converter()
	},
	propertyFormat: "<code>{$name}: <literal>{$value}</literal></code>",
	methodFormat: "<code>{$name}</code>: <em>function</em>(<code><literal>{$args}</literal></code>)",
	format: function(inObject) {
		var html = [];
		this._format(inObject, html);
		return html.join('');
	},
	_format: function(c, html) {
		if (this.shouldFormat(c)) {
			switch (c.type) {
				case "module":
					this.formatModule(c, html);
					break;
				case "function":
					this.formatFunction(c, html);
					break;
				case "kind":
					this.formatKind(c, html);
					break;
				case "object":
					this.formatObject(c, html);
					break;
			}
		}
	},
	shouldFormat: function(c) {
		return (c.group == "public");
	},
	formatModule: function(inModule, inHtml) {
		var path = inModule.path, data = inModule.module;
		inHtml.push('<blockquote><a name="' + path + '">' + path + '</a></blockquote>');
		inHtml.push(this.formatComment(data.comment));
		var objects = data.objects;
		for (var i=0, c; c=objects[i]; i++) {
			this._format(c, inHtml);
		}
	},
	formatFunction: function(c, html) {
		html.push('<h2><a name="' + c.name + '">' + c.name + "</a></h2>");
		html.push(enyo.macroize(this.methodFormat, c));
		html.push(this.formatComment(c.comment));
	},
	formatKind: function(c, html) {
		html.push('<h1><a name="' + c.name.value + '">' + c.name.value + "</a></h1>");
		html.push(this.formatComment(c.comment));
		if (c.kind) {
			html.push('<h2>Extends</h2>');
			html.push('<h4>' + this.formatLinkName(c.kind.value) + '</h4>');
		}
		this.addProperties(c.published, "Published Properties", html);
		this.addProperties(c.events, "Published Events", html);
		this.addMethods(c.methods, "Methods", html);
		this.addInherited(c, "Inheritance", html);
	},
	addProperties: function(inProperties, inTitle, inHtml) {
		if (inProperties) {
			inHtml.push('<h2>' + inTitle + '</h2>');
			inHtml.push(this.formatPropList(inProperties.value.properties, this.propertyFormat));
		}
	},
	addMethods: function(inMethods, inTitle, inHtml) {
		if (inMethods) {
			inMethods.names.sort();
			var p = this.formatPropItems(inMethods, this.methodFormat);
			if (p.length) {
				inHtml.push('<h2>' + inTitle + '</h2>');
				inHtml.push(this.formatPropItemList(p));
			}
		}
	},
	addInherited: function(inObject, inTitle, inHtml) {
		var h = this.formatInherited(inObject);
		if (h) {
			inHtml.push(/*'<h1>' + inTitle + '</h1>',*/ h);
		}
	},
	formatLinkName: function(inName) {
		return '<a href="#' + inName + '"><em>' + inName + '</em></a>'
	},
	formatInherited: function(inKind) {
		var pub = [], events = [], methods = [], kind = inKind;
		while (kind && kind.kind) {
			var superName = kind.kind.value;
			var module = Module.topicMap[superName];
			kind = module && module.kindByName(superName);
			if (!kind) {
				break;
			}
			var superName = this.formatLinkName(superName);
			// simple-listings
			if (kind.published && kind.published.value.properties) {
				this.addSimplePropertyList(kind.published.value.properties, "Published properties inherited from " + superName, pub);
			}
			if (kind.events && kind.events.value.properties) {
				this.addSimplePropertyList(kind.events.value.properties, "Events inherited from " + superName, events);
			}
			this.addSimplePropertyList(kind.methods, "Methods inherited from " + superName, methods);
			// full-documentation
			//this.addProperties(kind.published, "Published properties inherited from " + superName, pub);
			//this.addProperties(kind.events, "Events inherited from " + superName, events);
			//this.addMethods(kind.methods, "Methods inherited from " + superName, methods);
		}
		return pub.join('') + events.join('') + methods.join('');
	},
	addSimplePropertyList: function(inProperties, inTitle, inHtml) {
		var html = [];
		if (inProperties && inProperties.names) {
			var public = [];
			for (var i=0, n; n=inProperties.names[i]; i++) {
				if (inProperties.map[n].group == "public") {
					public.push(n);
				}
			}
			if (public.length) {
				inHtml.push('<h2>' + inTitle + '</h2>');
				inHtml.push("<blockquote>" + public.join(", ") + "</blockquote>");
			}
		}
	},
	formatObject: function(c, html) {
		var name = c.name || "<anonymous>";
		html.push('<h1><a name="' + name + '">' + name + "</a></h1>");
		html.push(this.formatComment(c.comment));
		//
		var p = this.formatPropItems(c.properties, "<code>{$name}: <literal>{$value}</literal></code>");
		if (p.length) {
			html.push('<h2>Properties</h2>');
			html.push(this.formatPropItemList(p));
		}
		/*
		if (c.properties.names.length) {
			html.push('<h2>Properties</h2>');
			html.push(formatPropList(c.properties, "<code>{$name}: <literal>{$value}</literal></code>"));
		}
		*/
		//
		if (c.methods.names.length) {
			html.push('<h2>Methods</h2>');
			c.methods.names.sort();
			html.push(this.formatPropList(c.methods, "<code>{$name}</code>: <em>function</em>(<code><literal>{$args}</literal></code>)"));
		}
	},
	formatComment: function(inComment) {
		if (!inComment) {
			return '';
		}
		//
		// Remove leading indent from comment
		// so markdown spacing is intact.
		// Assumes first non-empty line in comment is block-left.
		//
		var lines = inComment.split(/\r?\n/);
		var indent = 0;
		for (var i=0, l; (l=lines[i]) != null; i++) {
			if (l.length > 0) {
				indent = l.search(/\S/);
				if (indent < 0) {
					indent = l.length;
				}
				break;
			}
		}
		if (indent) {
			for (var i=0, l; (l=lines[i]) != null; i++) {
				lines[i] = l.slice(indent);
			}
		}
		var comment = lines.join("\n");
		//
		// Convert markdown format to html
		//
		//return '<p>' + comment + '</p>';
		return '<p>' + Formatter.showdown.makeHtml(comment) + '</p>';
	},
	formatPropList: function(inList, inFormat) {
		var names = inList.names, map = inList.map;
		var html = [];
		html.push("<ul>");
		for (var ip=0, n, p, v; n=names[ip]; ip++) {
			p = map[n];
			if (p && p.group == "public") {
				html.push("<li>");
				v = null;
				if (p.value && p.value.properties) {
					v = p.value;
					p.value = '';
				}
				html.push(enyo.macroize(inFormat, p));
				if (v) {
					p.value = v;
					html.push(this.formatPropList(v.properties, "<code>{$name}</code>: <code>{$value}</code>"));
				}
				html.push(this.formatComment(p.comment));
				html.push("</li>");
			}
		}
		html.push("</ul>");
		return html.join('');
	},
	formatPropItems: function(inList, inFormat) {
		var html = [];
		var names = inList.names, map = inList.map;
		for (var ip=0, n, p, v; n=names[ip]; ip++) {
			p = map[n];
			if (p && p.group == "public") {
				html.push("<li>");
				v = null;
				if (p.value && p.value.properties) {
					v = p.value;
					p.value = '';
				}
				html.push(enyo.macroize(inFormat, p));
				if (v) {
					p.value = v;
					html.push(this.formatPropList(v.properties, "<code>{$name}</code>: <code>{$value}</code>"));
				}
				html.push(this.formatComment(p.comment));
				html.push("</li>");
			}
		}
		return html;
	},
	formatPropItemList: function(inList) {
		return "<ul>" + inList.join('') + "</ul>";
	}
});
