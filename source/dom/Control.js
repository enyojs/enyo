enyo.kind({
	name: "enyo.Control",
	kind: enyo.UiComponent,
	published: {
		tag: "div",
		attributes: null,
		classes: "",
		style: "",
		content: "",
		showing: true,
		//* If false, HTML codes in _content_ are escaped before rendering.
		allowHtml: false,
		//
		// convenience properties for common attributes
		//
		src: "",
		//
		// esoteric
		//
		canGenerate: true,
		//
		// ad hoc properties:
		//
		// for layouts
		fit: false,
		// for ares
		isContainer: false
	},
	handlers: {
		ontap: "tap"
	},
	defaultKind: "Control",
	controlClasses: "",
	//* @protected
	node: null,
	generated: false,
	create: function() {
		// initialize style databases
		this.initStyles();
		// superkind initialization
		this.inherited(arguments);
		// 'showing' is tertiary method for modifying display style
		// setting 'display: none;' style at initialization time will
		// not work if 'showing' is true.
		this.showingChanged();
		// Notes:
		// - 'classes' does not reflect the complete set of classes on an object; the complete set is in
		//   this.attributes.class. The '*Class' apis affect this.attributes.class.
		// - use addClass instead of setClasses here, by convention 'classes' is reserved for instance objects
		// - inheritors should 'addClass' to add classes
		// - setClasses removes the old classes and adds the new one, setClassAttribute replaces all classes
		this.addClass(this.kindClasses);
		this.addClass(this.classes);
		this.initProps(["id", "content", "src"]);
	},
	destroy: function() {
		this.removeNodeFromDom();
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		// each instance has it's own attributes array, the union of the prototype attributes and user specified attributes
		this.attributes = enyo.mixin(enyo.clone(this.kindAttributes), this.attributes);
	},
	initProps: function(inPropNames) {
		// for each named property, trigger the *Changed handler if the property value is truthy
		for (var i=0, n, cf; n=inPropNames[i]; i++) {
			if (this[n]) {
				// FIXME: awkward
				cf = n + "Changed";
				if (this[cf]) {
					this[cf]();
				}
			}
		}
	},
	classesChanged: function(inOld) {
		this.removeClass(inOld);
		this.addClass(this.classes);
	},
	// modify components we create ourselves
	/*
	adjustComponentProps: function(inProps) {
		if (this.controlClasses) {
			inProps.classes = (inProps.classes ? inProps.classes + " " : "") + this.controlClasses;
		}
		this.inherited(arguments);
	},
	*/
	addChild: function(inControl) {
		inControl.addClass(this.controlClasses);
		this.inherited(arguments);
	},
	removeChild: function(inControl) {
		this.inherited(arguments);
		inControl.removeClass(this.controlClasses);
	},
	// event filter
	strictlyInternalEvents: {onenter: 1, onleave: 1},
	dispatchEvent: function(inEventName, inEvent, inSender) {
		// prevent dispatch and bubble of events that are strictly internal (e.g. enter/leave)
		if (this.strictlyInternalEvents[inEventName] && this.isInternalEvent(inEvent)) {
			return true;
		}
		return this.inherited(arguments);
	},
	isInternalEvent: function(inEvent) {
		var rdt = enyo.dispatcher.findDispatchTarget(inEvent.relatedTarget);
		return rdt && rdt.isDescendantOf(this);
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
		Gets the value of an attribute on this object.

		If this Control has a node, the attribute value is retrieved from the node, otherwise
		it's read from the _attributes_ property of the Control itself.

		Caveat: if the Control is rendered, the _attributes_ property is used to construct
		the rendering, and values that have changed on the node itself are lost.

			// Get the value attribute for this DomNode
			var value = this.getAttribute("tabIndex");
	*/
	getAttribute: function(inName) {
		return this.hasNode() ? this.node.getAttribute(inName) : this.attributes[inName];
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
		if (this.hasNode()) {
			this.attributeToNode(inName, inValue);
		}
		this.invalidateTags();
	},
	getNodeProperty: function(inName, inDefault) {
		if (this.hasNode()) {
			return this.node[inName];
		} else {
			return inDefault;
		}
	},
	setNodeProperty: function(inName, inValue) {
		if (this.hasNode()) {
			this.node[inName] = inValue;
		}
	},
	/**
		Convenience function for setting the _class_ attribute. 
		The _class_ attribute represents the CSS classes assigned to this object.
		Note that _inClass_ can be a string that contains multiple CSS classes separated by spaces.

			this.$.control.setClassAttribute("box blue-border highlighted");
	*/
	setClassAttribute: function(inClass) {
		this.setAttribute("class", inClass);
	},
	/**
		Convenience function for getting the _class_ attribute. 
		The _class_ attribute represents the CSS classes assigned to this object.
		Note that a _class_ can be a string that contains multiple CSS classes separated by spaces.

			var cssClasses = this.$.control.getClassAttribute();
	*/
	getClassAttribute: function() {
		return this.attributes["class"] || "";
	},
	/**
		Returns true if the _class_ attribute contains a substring matching _inClass_.

		The _class_ attribute is a string that can contain multiple CSS classes.
		This method tests if a particular class is part of the set of classes on this
		Control.

			// returns true if _class_ is "bar foo baz", but false for "barfoobaz"
			var hasFooClass = this.$.control.hasClass("foo");
	*/
	hasClass: function(inClass) {
		return inClass && ((" " + this.getClassAttribute() + " ").indexOf(" " + inClass + " ") >= 0);
	},
	/**
		Adds CSS class name _inClass_ to the _class_ attribute of this object.

			// add the highlight class to this object
			this.addClass("highlight");
	*/
	addClass: function(inClass) {
		if (inClass && !this.hasClass(inClass)) {
			var c = this.getClassAttribute();
			this.setClassAttribute(c + (c ? " " : "") + inClass);
		}
	},
	/**
		Removes substring _inClass_ from the _class_ attribute of this object.

		inClass must have no leading or trailing spaces.
		
		Using a compound class name is supported, but the name is treated atomically.
		For example, given "a b c", removeClass("a b") will produce "c", but removeClass("a c") will produce "a b c".

			// remove the highlight class from this object
			this.removeClass("highlight");
	*/
	removeClass: function(inClass) {
		if (inClass && this.hasClass(inClass)) {
			var c = this.getClassAttribute();
			c = (" " + c + " ").replace(" " + inClass + " ", " ").slice(1, -1);
			this.setClassAttribute(c);
		}
	},
	/**
		Adds or removes substring _inClass_ from the _class_ attribute of this object based
		on the value of _inTrueToAdd_.

		If _inTrueToAdd_ is truthy, then _inClass_ is added, otherwise _inClass_ is removed.

			// add or remove the highlight class, depending on the "highlighted" property
			this.addRemoveClass("highlight", this.highlighted);
	*/
	addRemoveClass: function(inClass, inTrueToAdd) {
		this[inTrueToAdd ? "addClass" : "removeClass"](inClass);
	},
	//
	// styles
	//
	initStyles: function() {
		this.domStyles = this.domStyles || {};
		enyo.Control.cssTextToDomStyles(this.kindStyle, this.domStyles);
		this.domCssText = enyo.Control.domStylesToCssText(this.domStyles);
	},
	styleChanged: function() {
		// FIXME: stomping on domStyles is problematic, there may be styles on this object
		// applied by layouts or other objects.
		// We may need a 'runtimeStyles' concept separate from a 'userStyles' concept, although
		// it's not clear what API calls like 'applyStyle' would affect, and which concept would take
		// precedence when there is a conflict.
		// Perhaps we can separate 'style' completely from 'domStyles'. API methods like applyStyle 
		// would affect domStyles, and the two style databases would be combined at render-time.
		// Alternatively, we can disallow changing "style" string at runtime and allow it to be set 
		// at init-time only (as it was in pre-ares enyo).
		//this.domStyles = {};
		//this.addStyles(this.kindStyle);
		//this.addStyles(this.style);
		this.invalidateTags();
		this.renderStyles();
	},
	/**
		Applies a single style value to this object.

			this.$.box.applyStyle("z-index", 4);

		You can remove a style by setting its value to null.

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
	domStylesChanged: function() {
		this.domCssText = enyo.Control.domStylesToCssText(this.domStyles);
		this.invalidateTags();
		this.renderStyles();
	},
	stylesToNode: function() {
		this.node.style.cssText = this.domCssText + this.style;
	},
	//
	//
	//
	/**
		Renders this object into DOM, generating a DOM node if needed.
	*/
	render: function() {
		if (this.parent) {
			// allow the parent to flow
			this.parent.beforeChildRender(this);
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
		if (pn == document.body) {
			this.setupBodyFitting();
		} else if (this.fit) {
			this.addClass("enyo-fit");
		}
		// generate our HTML
		pn.innerHTML = this.generateHtml();
		// post-rendering tasks
		this.rendered();
		// support method chaining
		return this;
	},
	write: function() {
		if (this.fit) {
			this.setupBodyFitting();
		}
		document.write(this.generateHtml());
		// post-rendering tasks
		this.rendered();
		// support method chaining
		return this;
	},
	setupBodyFitting: function() {
		enyo.dom.applyBodyFit();
		this.addClass("enyo-fit");
	},
	/**
		Override to perform tasks that require access to the DOM node.

			rendered: function() {
				this.inherited(arguments);
				// do some task
			}
	*/
	rendered: function() {
		// CAVEAT: currently we use one entry point ('reflow') for
		// post-render layout work *and* post-resize layout work.
		this.reflow();
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

			{left: _offsetLeft_, top: _offsetTop_, width: _offsetWidth_, height: _offsetHeight_}

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
		var s = this.domStyles, unit = inUnit || "px";
		var extents = ["width", "height", "left", "top", "right", "bottom"];
		for (var i=0, b, e; e=extents[i]; i++) {
			b = inBounds[e];
			if (b || b === 0) {
				s[e] = b + (!enyo.isString(b) ? unit : '');
			}
		}
		this.domStylesChanged();
	},
	//* @protected
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
	contentChanged: function() {
		if (this.hasNode()) {
			this.renderContent();
		}
	},
	getSrc: function() {
		return this.getAttribute("src");
	},
	srcChanged: function() {
		this.setAttribute("src", this.src);
	},
	attributesChanged: function() {
		this.invalidateTags();
		this.renderAttributes();
	},
	//
	// HTML rendering
	//
	invalidateTags: function() {
		this.tagsValid = false;
	},
	prepareTags: function() {
		//this.log("(" + this.owner.name + ") " + this.name + ": " + this.id + " (" + this.attributes.id + ")");
		//var htmlStyle = enyo.Control.domStylesToCssText(this.domStyles);
		var htmlStyle = this.domCssText + this.style;
		this._openTag = '<' 
			+ this.tag
			+ (htmlStyle ? ' style="' + htmlStyle + '"' : "")
			+ enyo.Control.attributesToHtml(this.attributes)
			;
		if (enyo.Control.selfClosing[this.tag]) {
			this._openTag += '/>';
			this._closeTag =  '';
		} else {
			this._openTag += '>';
			this._closeTag =  '</' + this.tag + '>';
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
			return this.allowHtml ? this.content : enyo.Control.escapeHtml(this.content);
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
		if (this.noDom) {
			return inContent;
		}
		if (!this.tagsValid) {
			this.prepareTags();
		}
		return this._openTag + inContent + this._closeTag;
	},
	// DOM, aka direct-to-node, rendering
	attributeToNode: function(inName, inValue) {
		if (inValue === null || inValue === false || inValue === "") {
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
		inParentNode.insertBefore(this.node, inBeforeNode || inParentNode.firstChild);
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
		this.node = document.createElement(this.tag);
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
	//
	//
	fitChanged: function(inOld) {
		this.parent.reflow();
	},
	//
	//
	statics: {
		/**
			return string with ampersand, less-than, and greater-than characters replaced with HTML entities, 
			e.g. '&lt;code&gt;"This &amp; That"&lt;/code&gt;' becomes '&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;' 
		*/
		escapeHtml: function(inText) {
			return inText != null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
		},
		//* @protected
		registerDomEvents: function(inId, inControl) {
			enyo.$[inId] = inControl;
		},
		unregisterDomEvents: function(inId) {
			enyo.$[inId] = null;
		},
		selfClosing: {img: 1, hr: 1, br: 1, area: 1, base: 1, basefont: 1, input: 1, link: 1, meta: 1,
			command: 1, embed: 1, keygen: 1, wbr: 1, param: 1, source: 1, track: 1, col: 1},
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
			return (cssText ? ' style="' + cssText + '"' : "");
		},
		/**
			return string with ampersand and double quote characters replaced with HTML entities, 
			e.g. 'hello from "Me & She"' becomes 'hello from &amp;quot;Me &amp;amp; She&amp;quot;' 
		*/
		escapeAttribute: function(inText) {
			return !enyo.isString(inText) ? inText : String(inText).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
		},
		attributesToHtml: function(inAttributeHash) {
			var n, v, h = '';
			for (n in inAttributeHash) {
				v = inAttributeHash[n];
				if (v !== null && v !== false && v !== "") {
					h += ' ' + n + '="' + enyo.Control.escapeAttribute(v) + '"';
				}
			}
			return h;
		}
	}
});

enyo.defaultCtor = enyo.Control;

enyo.Control.subclass = function(ctor, props) {
	// Control classes may declare properties that are intended
	// to stack with superclass properties.
	//
	// We resort to prototype magic to assemble these properties
	// at kind declaration time, in the interest of efficiency
	// and ease of use.
	//
	// However, the properties are no longer 'live' in prototypes 
	// because  of this magic. I.e. changes to the prototype of 
	// a Control subclass will not necessarily be reflected in
	// instances of that Control (e.g. chained prototypes).
	//
	// These properties are also renamed to kind* to allow
	// combining with instance properties.
	//
	var proto = ctor.prototype;
	//
	// 'kindClasses' comes either from our inheritance chain (e.g. proto's prototype chain) 
	// or has been forced by a kind declaration.
	//
	if (proto.classes) {
		var kc = proto.kindClasses;
		proto.kindClasses = (kc ? kc + " " : "") + proto.classes;
		proto.classes = "";
	}
	if (proto.style) {
		var ks = proto.kindStyle;
		proto.kindStyle = (ks ? ks + ";" : "") + proto.style;
		proto.style = "";
	}
	if (props.attributes) {
		var ka = proto.kindAttributes;
		proto.kindAttributes = enyo.mixin(enyo.clone(ka), proto.attributes);
		proto.attributes = null;
	}
};
