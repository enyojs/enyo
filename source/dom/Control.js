enyo.kind({
	name: "enyo.Control",
	kind: enyo.Container,
	events: {
		onmousedown: "",
		onmouseup: "",
		onclick: ""
	},
	published: {
		tagName: "div",
		attributes: {},
		style: "",
		content: "",
		showing: true,
		canGenerate: true,
		// convenience properties for common attributes
		src: "",
		disabled: ""
	},
	//* @protected
	node: null,
	generated: false,
	defaultKind: "Control",
	constructor: function() {
		this.inherited(arguments);
		// we need fresh instances of these hashes (that may otherwise be shared in a prototype)
		this.attributes = enyo.clone(this.attributes);
		this.domStyles = enyo.clone(this.domStyles);
	},
	create: function() {
		this.inherited(arguments);
		//this.idChanged();
		// we have primary 'domStyles' and secondary 'style' to deal with
		this.initStyles();
		// 'showing' is tertiary method for modifying display style
		// setting 'display: none;' style at initialization time will
		// not work if showing is true.
		//this.showingChanged();
		// Notes:
		// - className is a virtual property, this.className value is only useful here.
		// - addClass instead of setClassName, because this.attributes.className may already have a value.
		// - inheritors should 'addClass' to add classes, or 'setClassName' to start over.
		// - should we implement initClassName to allow subclasses more control over inherited behavior?
		this.addClass(this.className);
		//this.contentChanged();
		//this.initProps(["Xid", "Xshowing", "Xcontent", "src", "disabled"]);
		this.initProps(["id", "showing", "content", "src", "disabled"]);
	},
	destroy: function() {
		this.removeNodeFromDom();
		this.inherited(arguments);
	},
	initProps: function(inPropNames) {
		// for each named property, if the instance value differs from the prototype value, trigger the *Changed handler
		for (var i=0, n; n=inPropNames[i]; i++) {
			if (this.ctor.prototype[n] != this[n]) {
				this.setProperty(n, this[n]);
			}
		}
	},
	adjustComponentProps: function(inProps) {
		this.inherited(arguments);
		if (inProps.kind && !enyo.constructorForKind(inProps.kind)) {
			inProps.tagName = inProps.kind;
			inProps.kind = enyo.Control;
		}
	},
	//
	//* @public
	/**
		Returns the DOM node representing the Control.
		If the Control is not currently rendered, it returns null.
		
		If hasNode() returns a value, the _node_ property will be valid and 
		can be checked directly.
		
		Once hasNode() is called, the returned value is made available in 
		the _node_ property of this Control.

		A Control will only return a node if it has been rendered.

			if (this.hasNode()) {
				console.log(this.node.nodeType);
			}
	*/
	hasNode: function() {
		// 'generated' is used to gate access to expensive findNodeById call
		return this.generated && (this.node || this.findNodeById());
	},
	/**
		Append the String value of _inAddendum_ to the _content_ of this Control.
	*/
	addContent: function(inAddendum) {
		this.setContent(this.content + inAddendum);
	},
	/**
		Applies a single style value to this object.

			this.$.box.applyStyle("z-index", 4);

		You can remove a style (restore it to default) by setting its value to null.

			this.$.box.applyStyle("z-index", null);
	*/
	applyStyle: function(inStyle, inValue) {
		this.domStyles[inStyle] = inValue;
		this.domStylesChanged();
	},
	/**
		Adds CSS styles to the set of styles assigned to this object.

		_inCssText_ is a string containing CSS styles in text format.

			this.$.box.addStyles("background-color: red; padding: 4px;");
	*/
	addStyles: function(inCssText) {
		enyo.Control.cssTextToDomStyles(inCssText, this.domStyles);
		this.domStylesChanged();
	},
	/**
		Sets the value of an attribute on this object. Pass null _inValue_ to remove an attribute.

			// set the tabIndex attribute for this DomNode
			this.setAttribute("tabIndex", 3);
			...
			// remove the index attribute
			this.setAttribute("index", null);
	*/
	setAttribute: function(inName, inValue) {
		this.attributes[inName] = inValue;
		this.attributesChanged();
	},
	/**
		Convenience function for setting the _className_ attribute. 
		The _className_ attribute represents the CSS classes assigned to this object.
		Note that a _className_ can be a string that contains multiple CSS classes separated by spaces.

			this.$.control.setClassName("box blue-border highlighted");
	*/
	setClassName: function(inClassName) {
		this.setAttribute("className", inClassName);
	},
	/**
		Convenience function for getting the _className_ attribute. 
		The _className_ attribute represents the CSS classes assigned to this object.
		Note that a _className_ can be a string that contains multiple CSS classes separated by spaces.

			var cssClasses = this.$.control.getClassName();
	*/
	getClassName: function() {
		return this.attributes.className || "";
	},
	/**
		Returns true if the _className_ attribute contains a class matching _inClass_.

		The _className_ attribute is a string that can contain multiple CSS classes.
		This method tests if a particular class is part of the set of classes on this
		Control.

			// returns true if _className_ is "bar foo baz", but false for "barfoobaz"
			var hasFooClass = this.$.control.hasClass("foo");
	*/
	hasClass: function(inClass) {
		return inClass && ((" " + this.getClassName() + " ").indexOf(" " + inClass + " ") >= 0);
	},
	/**
		Adds CSS class name _inClass_ to the _className_ attribute of this object.

			// add the highlight class to this object
			this.addClass("highlight");
	*/
	addClass: function(inClass) {
		if (inClass && !this.hasClass(inClass)) {
			var c = this.getClassName();
			this.setClassName(c + (c ? " " : "") + inClass);
		}
	},
	/**
		Removes CSS class name _inClass_ from the _className_ attribute of this object.

		inClass must have no leading or trailing spaces.
		
		Using a compound class name is supported, but the name is treated atomically.
		For example, given "a b c", removeClass("a b") will produce "c", but removeClass("a c") will produce "a b c".

			// remove the highlight class from this object
			this.removeClass("highlight");
	*/
	removeClass: function(inClass) {
		if (inClass && this.hasClass(inClass)) {
			var c = this.getClassName();
			c = (" " + c + " ").replace(" " + inClass + " ", " ").slice(1, -1);
			this.setClassName(c);
		}
	},
	/**
		Adds, or removes, CSS class name _inClass_ from the _className_ attribute of this object based
		on the value of _inTrueToAdd_.

		Sending a _true_ value for _inTrueToAdd_ will cause the class to be added. Sending a _false_ value for that parameter will remove the class. 

			// add or remove the highlight class, depending on the "highlighted" property
			this.addRemoveClass("highlight", this.highlighted);
	*/
	addRemoveClass: function(inClass, inTrueToAdd) {
		this[inTrueToAdd ? "addClass" : "removeClass"](inClass);
	},
	/**
		Renders this object into DOM, generating a DOM node if needed.
	*/
	render: function() {
		if (this.parent) {
			// allow the parent to flow
			this.parent.beforeChildRender(this)
		}
		if (!this.hasNode()) {
			this.renderNode();
		}
		if (this.hasNode()) {
			this.renderDom();
			this.rendered();
		}
		// return 'this' to support method chaining
		return this;
	},
	/**
		Renders this object into the DOM node referenced by _inParentNode_.
	*/
	renderInto: function(inParentNode) {
		// clean up render flags and memoizations
		this.teardownRender();
		// inParentNode can be a string id or a node reference
		var pn = enyo.dom.byId(inParentNode);
		// 1: fit to nodes with non-auto height (NOTE: webkit td's have "0px" when unsized)
		/*
		var cs = window.getComputedStyle(pn, null);
		if (cs.height !== "auto" && cs.height !== "0px") {
			this.addClass("enyo-fit");
		}
		// 2: fit if rendering into body
		else*/ if (pn == document.body) {
			this.addClass("enyo-fit");
		}
		// generate our HTML
		pn.innerHTML = this.generateHtml();
		// post-rendering tasks
		this.rendered();
		// return 'this' to support method chaining
		return this;
	},
	write: function() {
		document.write(this.generateHtml());
		// post-rendering tasks
		this.rendered();
		// support method chaining
		return this;
	},
	/**
		Override to perform tasks that require access to the DOM node.

			rendered: function() {
				this.inherited(arguments);
				// do some task
			}
	*/
	rendered: function() {
		for (var i=0, c; c=this.children[i]; i++) {
			c.rendered(); 
		}
	},
	/**
		Shows this node (alias for _setShowing(true)_).
	*/
	show: function() {
		this.setShowing(true);
	},
	/**
		Hides this node (alias for _setShowing(false)_).
	*/
	hide: function() {
		this.setShowing(false);
	},
	/**
		Returns an object describing the geometry of this object, like so:

		{code}{left: _offsetLeft_, top: _offsetTop_, width: _offsetWidth_, height: _offsetHeight_}{code}

		Values returned are only valid if _hasNode()_ is truthy.

			var bounds = this.getBounds();
			console.log(bounds.width);
	*/
	getBounds: function() {
		var n = this.node || this.hasNode() || 0;
		return {left: n.offsetLeft, top: n.offsetTop, width: n.offsetWidth, height: n.offsetHeight};
	},
	/**
		Set any or all of geometry style properties _width_, _height_, _left_, _top_, _right_ and _bottom_.

		Values can be specified as strings (already with units), or as numbers when a unit is provided in _inUnit_.

			this.setBounds({width: 100, height: 100}, "px"); // adds style properties like "width: 100px; height: 100px;"
			//
			this.setBounds({width: "10em", right: "30pt"}); // adds style properties like "width: 10em; right: 30pt;"
	*/
	setBounds: function(inBounds, inUnit) {
		var s = this.domStyles;
		var extents = ["width", "height", "left", "top", "right", "bottom"];
		for (var i=0, e; e=extents[i]; i++) {
			if (inBounds[e] || inBounds[e] === 0) {
				s[e] = inBounds[e] + inUnit;
			}
		}
		this.domStylesChanged();
	},
	//* @protected
	importProps: function(inProps) {
		if (inProps) {
			// FIXME: there are some props that we handle specially and do not want to mix in directly.
			if (inProps.style) {
				this.addStyles(inProps.style);
				// FIXME: needs review: this.style used to be kept in sync with domStyles but this is no longer the case
				// therefore we lose user data if we delete the value here.
				//delete inProps.style;
			}
			if (inProps.domStyles) {
				enyo.mixin(this.domStyles, inProps.domStyles);
				delete inProps.domStyles;
			}
			if (inProps.attributes) {
				enyo.mixin(this.attributes, inProps.attributes);
				delete inProps.attributes;
			}
			// FIXME: 'className' property can be set in the prototype as well as inProps, so we combine them here 
			// in both cases it's only used for initialization, and is otherwise virtual
			if (inProps.className && this.className) {
				this.className += " " + inProps.className;
				delete inProps.className;
			}
		}
		this.inherited(arguments);
	},
	initStyles: function() {
		// 'domStyles' is the canonical style property
		// 'style' is secondary if they compete
		if (this.style) {
			this.styleChanged();
		} else {
			this.domStylesChanged();
		}
	},
	// expensive, other methods do work to avoid calling here
	findNodeById: function() {
		return this.id && (this.node = enyo.dom.byId(this.id));
	},
	idChanged: function(inOld) {
		if (inOld) {
			enyo.Control.unregisterDomEvents(inOld);
		}
		this.setAttribute("id", this.id);
		if (this.id) {
			enyo.Control.registerDomEvents(this.id, this);
		}
	},
	styleChanged: function() {
		// FIXME: stomping on domStyles is problematic, there may be styles on this object
		// applied by layouts or other objects.
		// We may need a 'runtimeStyles' concept separate from a 'userStyles' concept, although
		// it's not clear what API calls like 'applyStyle' would affect, and which concept would take
		// precendence when there is a conflict.
		// Perhaps we can separate 'style' completely from 'domStyles'. API methods like applyStyle 
		// would affect domStyles, and the two style database would be combined at render-time.
		// Alternatively, we can disallow changing "style" string at runtime and allow it to be set 
		// at init-time only (as it was in pre-ares enyo).
		this.domStyles = {};
		this.addStyles(this.style);
	},
	contentChanged: function() {
		if (this.hasNode()) {
			this.renderContent();
		}
	},
	domStylesChanged: function() {
		//this.style = enyo.Control.domStylesToCssText(this.domStyles);
		//this.getShowing();
		this.invalidateTags();
		this.renderStyles();
	},
	srcChanged: function(inValue) {
		this.setAttribute("src", inValue);
	},
	disabledChanged: function(inValue) {
		this.setAttribute("disabled", inValue);
	},
	attributesChanged: function() {
		this.invalidateTags();
		this.renderAttributes();
	},
	// HTML rendering
	invalidateTags: function() {
		this.tagsValid = false;
	},
	prepareTags: function() {
		//this.log("(" + this.owner.name + ") " + this.name + ": " + this.id + " (" + this.attributes.id + ")");
		var htmlStyle = enyo.Control.domStylesToCssText(this.domStyles);
		this._openTag = '<' 
			+ this.tagName
			+ (htmlStyle ? ' style="' + htmlStyle + '"' : "")
			+ enyo.Control.attributesToHtml(this.attributes)
			;
		if (enyo.Control.selfClosing[this.tagName]) {
			this._openTag += '/>';
			this._closeTag =  '';
		} else {
			this._openTag += '>';
			this._closeTag =  '</' + this.tagName + '>';
		}
		this.tagsValid = true;
	},
	generateHtml: function() {
		if (this.canGenerate === false) {
			return '';
		}
		// do this first in case content generation affects outer html (styles or attributes)
		var c = this.generateInnerHtml();
		// generate tag, styles, attributes
		var h = this.generateOuterHtml(c);
		// NOTE: 'generated' is used to gate access to findNodeById in
		// hasNode, because findNodeById is expensive.
		// NOTE: we typically use 'generated' to mean 'created in DOM'
		// but that has not actually happened at this point.
		// We set 'generated = true' here anyway to avoid having to walk the
		// control tree a second time (to set it later).
		// The contract is that insertion in DOM will happen synchronously 
		// to generateHtml() and before anybody should be calling hasNode().
		this.generated = true;
		return h;
	},
	generateInnerHtml: function() {
		// Flow can alter the way that html content is rendered inside
		// the container regardless if there are children.
		this.flow();
		if (this.children.length) {
			return this.generateChildHtml();
		} else {
			return this.content;
		}
	},
	generateChildHtml: function() {
		var results = '';
		for (var i=0, c; c=this.children[i]; i++) {
			var h = c.generateHtml();
			if (c.prepend) {
				// FIXME: does webkit's fast string-consing work in reverse?
				results = h + results;
			} else {
				results += h; 
			}
		}
		return results;
	},
	generateOuterHtml: function(inContent) {
		if (!this.tagsValid) {
			this.prepareTags();
		}
		return this._openTag + inContent + this._closeTag;
	},
	// DOM, aka direct-to-node, rendering
	attributeToNode: function(inName, inValue) {
		if (inName == "className") {
			inName = "class";
		}
		if (inValue === null) {
			this.node.removeAttribute(inName);
		} else {
			this.node.setAttribute(inName, inValue);
		}
	},
	attributesToNode: function() {
		for (var n in this.attributes) {
			this.attributeToNode(n, this.attributes[n]);
		}
	},
	stylesToNode: function() {
		this.node.style.cssText = enyo.Control.domStylesToCssText(this.domStyles);
	},
	getParentNode: function() {
		return this.parentNode || (this.parent && this.parent.hasNode());
	},
	addNodeToParent: function() {
		if (this.node) {
			var pn = this.getParentNode();
			if (pn) {
				this[this.prepend ? "insertNodeInParent" : "appendNodeToParent"](pn);
			}
		}
	},
	appendNodeToParent: function(inParentNode) {
		inParentNode.appendChild(this.node);
	},
	insertNodeInParent: function(inParentNode, inBeforeNode) {
		inParentNode.insertBefore(this.node, inBeforeNode || pn.firstChild);
	},
	removeNodeFromDom: function() {
		if (this.hasNode() && this.node.parentNode) {
			this.node.parentNode.removeChild(this.node);
		}
	},
	teardownRender: function() {
		this.teardownChildren();
		this.node = null;
		this.generated = false;
	},
	teardownChildren: function() {
		if (this.generated) {
			for (var i=0, c; c=this.children[i]; i++) {
				c.teardownRender();
			}
		}
	},
	renderNode: function() {
		this.teardownRender();
		this.node = document.createElement(this.tagName);
		this.addNodeToParent();
		this.generated = true;
	},
	renderDom: function() {
		this.renderAttributes();
		this.renderStyles();
		this.renderContent();
	},
	renderContent: function() {
		this.teardownChildren();
		this.node.innerHTML = this.generateInnerHtml();
	},
	renderStyles: function() {
		if (this.hasNode()) {
			this.stylesToNode();
		}
	},
	renderAttributes: function() {
		if (this.hasNode()) {
			this.attributesToNode();
		}
	},
	beforeChildRender: function() {
		// if we are generated, we should flow before rendering a child
		// if not, the render context isn't ready anyway
		if (this.generated) {
			this.flow();
		}
	},
	syncDisplayToShowing: function() {
		var ds = this.domStyles;
		if (this.showing) {
			// note: only show a node if it's actually hidden
			// this way we prevent overriding the value of domStyles.display
			if (ds.display == "none") {
				this.applyStyle("display", this._displayStyle || "");
			}
		} else {
			// cache the previous showing value of display
			// note: we could use a class to hide a node, but then
			// hide would not override a setting of display: none in style,
			// which seems bad.
			this._displayStyle = (ds.display == "none" ? "" : ds.display);
			this.applyStyle("display", "none");
		}
	},
	showingChanged: function() {
		this.syncDisplayToShowing();
	},
	getShowing: function() {
		// 'showing' specifically means domStyles.display !== 'none'.
		// 'showing' does not imply the node is actually visible or even rendered in DOM,
		// it simply reflects this state of this specific property as a convenience.
		return this.showing = (this.domStyles.display != "none");
	},
	statics: {
		//* @protected
		registerDomEvents: function(inId, inControl) {
			enyo.$[inId] = inControl;
		},
		unregisterDomEvents: function(inId) {
			enyo.$[inId] = null;
		},
		selfClosing: {
			img: 1
		},
		cssTextToDomStyles: function(inText, inStyleHash) {
			if (inText) {
				// remove spaces between rules, then split rules on delimiter (;)
				var rules = inText.replace(/; /g, ";").split(";");
				// parse string styles into name/value pairs
				for (var i=0, s, n, v, rule; rule=rules[i]; i++) {
					// "background-image: url(http://foo.com/foo.png)" => ["background-image", "url(http", "//foo.com/foo.png)"]
					s = rule.split(":");
					// n = "background-image", s = ["url(http", "//foo.com/foo.png)"]
					n = s.shift();
					// v = ["url(http", "//foo.com/foo.png)"].join(':') = "url(http://foo.com/foo.png)"
					v = s.join(':');
					// store name/value pair
					inStyleHash[n] = v;
				}
			}
		},
		domStylesToCssText: function(inStyleHash) {
			var n, v, text = '';
			for (n in inStyleHash) {
				v = inStyleHash[n];
				if ((v !== null) && (v !== undefined) && (v !== "")) {
					text +=  n + ':' + v + ';';
				}
			}
			return text;
		},
		stylesToHtml: function(inStyleHash) {
			var cssText = enyo.Control.domStylesToCssText(inStyleHash);
			return (cssText ? ' style="' + cssText + '"' : "")
		},
		/**
			return string with ampersand and double quote characters replaced with HTML entities, 
			e.g. 'hello from "Me & She"' becomes 'hello from &amp;quot;Me &amp;amp; She&amp;quot;' 
		*/
		escapeAttribute: function(inText) {
			return inText != null ? String(inText).replace(/&/g,'&amp;').replace(/"/g,'&quot;') : '';
		},
		attributesToHtml: function(inAttributeHash) {
			var n, v, h = '';
			for (n in inAttributeHash) {
				v = inAttributeHash[n];
				if (v !== null && v !== "") {
					if (n == "className") {
						n = "class";
					}
					h += ' ' + n + '="' + enyo.Control.escapeAttribute(v) + '"';
				}
			}
			return h;
		}
	}
});