(function (enyo, scope) {

	var kind = enyo.kind;

	var UiComponent = enyo.UiComponent,
		HTMLStringDelegate = enyo.HTMLStringDelegate;

	/**
	* _enyo.Control_ is a [component]{@link enyo.UiComponent} that controls a
	* [DOM]{@link external:DOM} [node]{@link external:Node} (i.e., an element in the user
	* interface). _Controls_ are generally visible and the user often interacts with them directly.
	* While things like buttons and input boxes are obviously controls, in Enyo, a control may be as
	* simple as a text item or as complex as an entire application. They both inherit the same basic
	* core capabilities from here.
	*
	* For more information, see the documentation on
	* [Controls]{@link http://enyojs.com/docs/2.4.0/key-concepts/controls.html} in the
	* [Enyo Developer Guide]{@link http://enyojs.com/docs/}.
	*
	* _If you make changes to enyo.Control, be sure to add or update the appropriate unit tests._
	*
	* @class enyo.Control
	* @extends enyo.UiComponent
	* @public
	*/
	var Control = kind(
		/** @lends enyo.Control.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Control',

		/**
		* @private
		*/
		kind: UiComponent,

		/**
		* @private
		*/
		noDefer: true,

		/**
		* @type {String}
		* @default 'enyo.Control'
		* @public
		*/
		defaultKind: 'enyo.Control',

		/**
		* The [DOM node]{@link external:DOM} tag name that should be created.
		*
		* @type {String}
		* @default 'div'
		* @public
		*/
		tag: 'div',

		/**
		* An attributes [hash]{@link external:Object} to be applied to the created
		* [DOM node]{@link external:DOM}.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		attributes: null,

		/**
		* [Boolean]{@link external:Boolean} flag for whether this element should "fit" or fill its
		* container's size.
		*
		* @type {Boolean}
		* @default null
		* @public
		*/
		fit: null,

		/**
		* Should this control allow HTML in its [content]{@linkcode enyo.Control.content} property.
		* If set to `false`, HTML will be encoded into [HTML entities]{@link external:entity} (like
		* `&lt;` and `&gt;`) for literal visual representation.
		*
		* @type {Boolean}
		* @default null
		* @public
		*/
		allowHtml: false,

		/**
		* Mymics the HTML `style` attribute
		*
		* @type {String}
		* @default ''
		* @public
		*/
		style: '',

		/**
		* @private
		*/
		kindStyle: '',

		/**
		* Mymics the HTML `class` attribute
		*
		* @type {String}
		* @default ''
		* @public
		*/
		classes: '',

		/**
		* @private
		*/
		kindClasses: '',

		/**
		* [Classes]{@link enyo.Control.classes} that are applied to all controls.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		controlClasses: '',

		/**
		* The text-based content of the Control. With the {@link enyo.Control.allowHtml} flag set to
		* `true`, you may set this property to a string of HTML.
		* @public
		*/
		content: '',

		/**
		* @todo Find out how to document "handlers".
		* @publiC
		*/
		handlers: {
			ontap: 'tap',
			onShowingChanged: 'showingChangedHandler'
		},

		/**
		* @private
		*/
		strictlyInternalEvents: {onenter: 1, onleave: 1},

		/**
		* @private
		*/
		isInternalEvent: function (event) {
			var rdt = enyo.dispatcher.findDispatchTarget(event.relatedTarget);
			return rdt && rdt.isDescendantOf(this);
		},

		// .................................
		// DOM NODE MANIPULATION API

		/**
		* Get the bounds for this control. The `top` and `left` properties returned by this method
		* represent the control's positional distance in pixels from either A) the first parent of
		* this control which is `absolute`ly or `relative`ly positioned, or B) the `document.body`.
		*
		* This is a shortcut convenience method for {@link enyo.dom.getBounds}.
		*
		* @returns {Object} An [object]{@link external:Object} containing `top`, `left`, `width`,
		*	and `height` properties.
		* @public
		*/
		getBounds: function () {
			var node = this.hasNode(),
				bounds = node && enyo.dom.getBounds(node);

			return bounds || {left: undefined, top: undefined, width: undefined, height: undefined};
		},

		/**
		* Set the absolute/relative position and/or size for this control. `Null` or `undefined`
		* property values are ignored. Optionally specify a _unit_ (valid CSS measurement unit) as a
		* [string]{@link exteral:String} to apply to each of the position/size assignments.
		*
		* @param {Object} bounds An [object]{@link external:Object} optionally containing one or
		*	more of the following properties: `width`, `height`, `top`, `right`, `bottom`, and/or
		*	`left`.
		* @param {String} [unit='px']
		* @public
		*/
		setBounds: function (bounds, unit) {
			var newStyle = '',
				extents = ['width', 'height', 'left', 'top', 'right', 'bottom'],
				i = 0,
				val,
				ext;

			// if no unit is supplied we default to pixels
			unit = unit || 'px';

			for (; (ext = extents[i]); ++i) {
				val = bounds[ext];
				if (val || val === 0) {
					newStyle += (ext + ':' + val + (typeof val == 'string' ? '' : unit) + ';');
				}
			}

			this.set('style', this.style + newStyle);
		},

		/**
		* Get the bounds for this control. The `top` and `left` properties returned by this method
		* represent the control's positional distance in pixels from `document.body`. To get the
		* bounds relative to this control's parent(s), use {@link enyo.Control.getBounds}.
		*
		* This is a shortcut convenience method for {@link enyo.dom.getAbsoluteBounds}.
		*
		* @returns {Object} An [object]{@link external:Object} containing `top`, `left`, `width`,
		*	and `height` properties.
		* @public
		*/
		getAbsoluteBounds: function () {
			var node = this.hasNode(),
				bounds = node && enyo.dom.getAbsoluteBounds(node);

			return bounds || {
				left: undefined,
				top: undefined,
				width: undefined,
				height: undefined,
				bottom: undefined,
				right: undefined
			};
		},

		/**
		* Shortcut method to set @{link enyo.Control.showing} to `true`.
		*
		* @public
		*/
		show: function () {
			this.set('showing', true);
		},

		/**
		* Shortcut method to set @{link enyo.Control.showing} to `false`.
		*
		* @public
		*/
		hide: function () {
			this.set('showing', false);
		},

		/**
		* Set this control to be [focused]{@link external:focus}.
		*
		* @public
		*/
		focus: function () {
			if (this.hasNode()) this.node.focus();
		},

		/**
		* [Blur]{@link external:blur} this control. (The opposite of {@link enyo.Control.focus}.)
		*
		* @public
		*/
		blur: function () {
			if (this.hasNode()) this.node.blur();
		},

		/**
		* Test whether this control currently has the [focus]{@link external:focus}.
		*
		* @returns {Boolean} Does this control have focus?
		*	True if yes, no if false.
		* @public
		*/
		hasFocus: function () {
			if (this.hasNode()) return document.activeElement === this.node;
		},

		/**
		* Test whether this control's [DOM node]{@link external:Node} has been created.
		*
		* @returns {Boolean} Has this [DOM node]{@link external:Node} been created?
		*	True if yes, no if false.
		* @public
		*/
		hasNode: function () {
			return this.generated && (this.node || this.findNodeById());
		},

		/**
		* Gets the requested property _name_ from the control's attributes
		* [hash]{@link external:Object}, from its cache of node attributes or if it has yet to be
		* cached, from the [node]{@link external:Node} itself.
		*
		* @param {String} name The attribute name to get.
		* @returns {(String|Null)} The value of the requested attribute, `null` if there isn't a
		*	[DOM node]{@link external:Node} yet.
		* @public
		*/
		getAttribute: function (name) {
			var node;

			// TODO: This is a fixed API assuming that no changes will happen to the DOM that
			// do not use it...original implementation of this method used the node's own
			// getAttribute method every time it could but we really only need to do that if we
			// weren't the ones that set the value to begin with -- in slow DOM situations this
			// could still be faster but it needs to be verified
			if (this.attributes.hasOwnProperty(name)) return this.attributes[name];
			else {
				node = this.hasNode();

				// we store the value so that next time we'll know what it is
				/*jshint -W093 */
				return (this.attributes[name] = (node ? node.getAttribute(name) : null));
				/*jshint +W093 */
			}
		},

		/**
		* Assign an attribute to a control's [node]{@link external:Node}. Assigning a `null`,
		* `false`, or empty string ("") _value_ to _name_ will remove the attribute from the
		* [node]{@link external:Node} altogether.
		*
		* @param {String} name Attribute name to assign/remove.
		* @param {(String|Number|null)} value The value to assign to _name_
		* @returns {this} Callee for chaining.
		* @public
		*/
		setAttribute: function (name, value) {
			var attrs = this.attributes,
				node = this.hasNode(),
				delegate = this.renderDelegate || Control.renderDelegate;

			if (name) {
				attrs[name] = value;

				if (node) {
					if (value == null || value === false || value === '') {
						node.removeAttribute(name);
					} else node.setAttribute(name, value);
				} else delegate.invalidate(this, 'attributes');
			}

			return this;
		},

		/**
		* Reads the _name_ property directly off of the [node]{@link external:Node}. Provide a
		* default _def_ to use if there is no [node]{@link external:Node} yet.
		*
		* @param {String} name [Node]{@link external:Node} property name to get.
		* @param {*} def Default value to apply if there is no [node]{@link external:Node}.
		* @returns {String} Value of the _name_ property or _def_ if the [node]{@link external:Node}
		*	was not available.
		* @public
		*/
		getNodeProperty: function (name, def) {
			return this.hasNode() ? this.node[name] : def;
		},

		/**
		* Sets the _name_ property _value_ directly on the [node]{@link external:Node}.
		*
		* @param {String} name [Node]{@link external:Node} property name to set.
		* @param {*} value Value to assign to the property.
		* @returns {this} Callee for chaining.
		* @public
		*/
		setNodeProperty: function (name, value) {
			if (this.hasNode()) this.node[name] = value;
			return this;
		},

		/**
		* Append additional content to this control.
		*
		* @param {String} content The new string to add to the end of the content property.
		* @returns {this} Callee for chaining.
		* @public
		*/
		addContent: function (content) {
			return this.set('content', this.get('content') + content);
		},

		// .................................

		// .................................
		// STYLE/CLASS API

		/**
		* Check whether this control has the `class` _name_ or not.
		*
		* @param {String} name The class or classes name to check for.
		* @returns {Boolean} Does it have the _name_ class or not?
		* @public
		*/
		hasClass: function (name) {
			return name && (' ' + this.classes + ' ').indexOf(' ' + name + ' ') > -1;
		},

		/**
		* Adds the provided class _name_ to this control's classes list.
		*
		* @param {String} name The name of the class to add.
		* @returns {this} Callee for chaining.
		* @public
		*/
		addClass: function (name) {
			var classes = this.classes || '';

			// NOTE: Because this method accepts a string and for efficiency does not wish to
			// parse it to determine if it is actually multiple classes we later pull a trick
			// to keep it normalized and synchronized with our attributes hash and the node's
			if (!this.hasClass(name)) {

				// this is hooked
				this.set('classes', classes + (classes ? (' ' + name) : name));
			}

			return this;
		},

		/**
		* Removes the provided class _name_ from this control's classes list.
		*
		* _Note: It is not advisable to remove multiple space-separated class names using this
		* method. Call this for each class name you'd like to remove._
		*
		* @param {String} name The name of the class to remove.
		* @returns {this} Callee for chaining.
		* @public
		*/
		removeClass: function (name) {
			var classes = this.classes;

			if (name) {
				this.set('classes', (' ' + classes + ' ').replace(' ' + name + ' ', ' ').trim());
			}

			return this;
		},

		/**
		* Add or Remove the provided class _name_ to this control conditionally based on the state
		* of the _add_ argument.
		*
		* @param {String} name The name of the class to remove.
		* @param {Boolean} add If this is `true`, the _name_ will be added as a class, `false` and
		*	it will be removed.
		* @returns {this} Callee for chaining.
		* @public
		*/
		addRemoveClass: function (name, add) {
			return name ? this[add ? 'addClass' : 'removeClass'](name) : this;
		},

		/**
		* @private
		*/
		classesChanged: function () {
			var classes = this.classes,
				node = this.hasNode(),
				attrs = this.attributes,
				delegate = this.renderDelegate || Control.renderDelegate;

			if (node) {
				if (classes || this.kindClasses) {
					node.setAttribute('class', classes || this.kindClasses);
				} else node.removeAttribute('class');

				this.classes = classes = node.getAttribute('class');
			}

			// we need to update our attributes.class value and flag ourselves to be
			// updated
			attrs['class'] = classes;

			// we want to notify the delegate that the attributes have changed in case it wants
			// to handle this is some special way
			delegate.invalidate(this, 'attributes');
		},

		/**
		* Apply some CSS styling directly with this. Use the _prop_ argument to specify the CSS
		* property name you'd like to set, and the _value_ for the value you'd like for the _prop_.
		* Setting _value_ to null will remove the CSS property _name_ altegether.
		*
		* @param {String} prop The CSS property to assign.
		* @param {(String|Number|null|undefined)} value The value to assign to _prop_. Setting this
		*	to `null`, `undefined` or empty string ("") will remove the property _prop_.
		* @returns {this} Callee for chaining.
		* @public
		*/
		applyStyle: function (prop, value) {

			// NOTE: This method deliberately avoids calling set('style', ...) for performance
			// as it will have already been parsed by the browser so we pass it on via the
			// notification system which is the same

			// TODO: Wish we could delay this potentially...
			// if we have a node we render the value immediately and update our style string
			// in the process to keep them synchronized
			var node = this.hasNode(),
				style = this.style,
				delegate = this.renderDelegate || Control.renderDelegate;

			if (value !== null && value !== '' && value !== undefined) {
				// update our current cached value
				if (node) {
					node.style[prop] = value;

					// cssText is an internal property used to help know when to sync and not
					// sync with the node in styleChanged
					this.style = this.cssText = node.style.cssText;

					// we need to invalidate the style for the delegate
					delegate.invalidate(this, 'style');

					// otherwise we have to try and prepare it for the next time it is rendered we
					// will need to update it because it will not be synchronized
				} else this.set('style', style + (' ' + prop + ':' + value + ';'));
			} else {

				// in this case we are trying to clear the style property so if we have the node
				// we let the browser handle whatever the value should be now and otherwise
				// we have to parse it out of the style string and wait to be rendered

				if (node) {
					node.style[prop] = '';
					this.style = this.cssText = node.style.cssText;

					// we need to invalidate the style for the delegate
					delegate.invalidate(this, 'style');
				} else {

					// this is a rare case to nullify the style of a control that is not
					// rendered or does not have a node
					style = style.replace(new RegExp(
						// This looks a lot worse than it is. The complexity stems from needing to
						// match a url container that can have other characters including semi-
						// colon and also that the last property may/may-not end with one
						'\\s*' + prop + '\\s*:\\s*[a-zA-Z0-9\\ ()_\\-\'"%,]*(?:url\\(.*\\)\\s*[a-zA-Z0-9\\ ()_\\-\'"%,]*)?\\s*(?:;|;?$)'
					),'');
					this.set('style', style);
				}
			}

			return this;
		},

		/**
		* A way to add several CSS properties and values all at once, using a single string. Similar
		* to the way the HTML `style` attribute works.
		*
		* @param {String} css A string containing one or more valid CSS styles.
		* @returns {this} Callee for chaining.
		*/
		addStyles: function (css) {
			var key,
				newStyle = '';

			if (typeof css == 'object') {
				for (key in css) newStyle += (key + ':' + css[key] + ';');
			} else newStyle = css || '';

			this.set('style', this.style + newStyle);
		},

		/**
		* @private
		*/
		styleChanged: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;

			// if the cssText internal string doesn't match then we know style was set directly
			if (this.cssText !== this.style) {

				// we need to render the changes and synchronize - this means that the style
				// property was set directly so we will reset it prepending it with the original
				// style (if any) for the kind and keeping whatever the browser is keeping
				if (this.hasNode()) {
					this.node.style.cssText = this.kindStyle + (this.style || '');
					// now we store the parsed version
					this.cssText = this.style = this.node.style.cssText;
				}

				// we need to ensure that the delegate has an opportunity to handle this change
				// separately if it needs to
				delegate.invalidate(this, 'style');
			}
		},

		/**
		* Retrieve a control's CSS property value. This isn't just pulling the assigned value of
		* _prop_, it's returning the browser's understanding of _prop_, the "computed" value. If
		* this control hasn't renederd yet, and you need a default value, like `0`, include it in
		* the arguments as _def_.
		*
		* @param {String} prop The property name to get.
		* @param {*} [def] An optional default value, in case the control isn't renederd yet.
		* @returns {(String|Number)} The computed value of _prop_, as the browser sees it.
		* @public
		*/
		getComputedStyleValue: function (prop, def) {
			return this.hasNode() ? enyo.dom.getComputedStyleValue(this.node, prop) : def;
		},

		/**
		* @private
		*/
		findNodeById: function () {
			return this.id && (this.node = enyo.dom.byId(this.id));
		},

		/**
		* @private
		*/
		idChanged: function (was) {
			if (was) Control.unregisterDomEvents(was);
			if (this.id) {
				Control.registerDomEvents(this.id, this);
				this.setAttribute('id', this.id);
			}
		},

		/**
		* @private
		*/
		contentChanged: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;
			delegate.invalidate(this, 'content');
		},

		/**
		* If the control has been generated, re-flow this control.
		*
		* @public
		*/
		beforeChildRender: function () {
			// if we are generated, we should flow before rendering a child;
			// if not, the render context isn't ready anyway
			if (this.generated) this.flow();
		},

		/**
		* @private
		*/
		showingChanged: function (was) {

			// if we are changing from not showing to showing we attempt to find whatever
			// our last known value for display was or use the default
			if (!was) this.applyStyle('display', this._display || '');

			// if we are supposed to be hiding the control then we need to cache our current
			// display state
			else if (!this.showing) {
				// we can't truly cache this because it _could_ potentially be set to multiple
				// values throughout its lifecycle although that seems highly unlikely...
				this._display = this.hasNode() ? this.node.style.display : '';
				this.applyStyle('display', 'none');
			}

			this.sendShowingChangedEvent(was);
		},

		/**
		* @private
		*/
		sendShowingChangedEvent: function (was) {
			var waterfall = (was === true || was === false),
				parent = this.parent;

			// make sure that we don't trigger the waterfall when this method
			// is arbitrarily called during _create_ and it should only matter
			// that it changed if our parent's are all showing as well
			if (waterfall && (parent ? parent.getAbsoluteShowing(true) : true)) {
				this.waterfall('onShowingChanged', {originator: this, showing: this.showing});
			}
		},

		/**
		* Returns true if this and all parents are showing.
		*
		* @param {Boolean} ignoreBounds If this is `true` it will not force a layout by retrieving
		*	computed bounds and rely on the return from {@link enyo.Control.showing} exclusively.
		* @returns {Boolean} Represents whether the control is showing (visible) or not.
		* @public
		*/
		getAbsoluteShowing: function (ignoreBounds) {
			var bounds = !ignoreBounds ? this.getBounds() : null,
				parent = this.parent;

			if (!this.generated || this.destroyed || !this.showing || (bounds &&
				bounds.height === 0 && bounds.width === 0)) {
				return false;
			}

			if (parent && parent.getAbsoluteShowing) {

				// we actually don't care what the parent says if it is the floating layer
				if (!this.parentNode || (this.parentNode !== enyo.floatingLayer.hasNode())) {
					return parent.getAbsoluteShowing(ignoreBounds);
				}
			}

			return true;
		},

		/**
		* Handles the _onshowingchanged_ event that is waterfalled by controls when their _showing_
		* value is modified. If the control is not showing itself already it will not continue the
		* waterfall. Overload this method for additional handling of this event.
		*
		* @private
		*/
		showingChangedHandler: function (sender, event) {
			return sender === this ? false : !this.showing;
		},

		/**
		* @private
		*/
		fitChanged: function () {
			this.parent.reflow();
		},

		/**
		* Test whether we are in fullscreen mode or not.
		*
		* @returns {Boolean} Are we in fullscreen mode?
		* @public
		*/
		isFullscreen: function () {
			return (this.hasNode() && this.node === enyo.fullscreen.getFullscreenElement());
		},

		/**
		* Ask for this control become fullscreen (like a video container). If the request is
		* granted, it will fill the screen, and return `true`. `False` if it does not succeed, and
		* won't become fullscreen.
		*
		* @returns {Boolean} `True` on success, `false` if fullscreen was not possible.
		* @public
		*/
		requestFullscreen: function () {
			if (!this.hasNode()) return false;

			if (enyo.fullscreen.requestFullscreen(this)) {
				return true;
			}

			return false;
		},

		/**
		* End fullscreen mode for this control.
		*
		* @returns {Boolean} If this control was in fullscreen mode before this was called, return
		*	`true` and take it out of fullscreen mode, `false` otherwise and does nothing.
		* @public
		*/
		cancelFullscreen: function() {
			if (this.isFullscreen()) {
				enyo.fullscreen.cancelFullscreen();
				return true;
			}

			return false;
		},

		// .................................

		// .................................
		// RENDER-SCHEME API

		/**
		* Determines whether the control is allowed to be generated, i.e. rendered into the
		* [DOM]{@link external:DOM} tree.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		canGenerate: true,

		/**
		* Determines whether the control is visible or hidden.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showing: true,

		/**
		* The [node]{@link external:Node} that this control will be rendered into.
		*
		* @type {enyo.Control}
		* @default null
		* @public
		*/
		renderDelegate: null,

		/**
		* State flag for whether the control has been generated yet or not.
		*
		* @type {Boolean}
		* @default false
		* @private
		*/
		generated: false,

		/**
		* Force the control to be rendered. You should use this sparingly as it can be costly, but
		* may be necessary in cases where a control or its contents were updated surreptitiously.
		*
		* @returns {this} Callee for chaining.
		* @public
		*/
		render: function () {

			// prioritize the delegate set for this control otherwise use the default
			var delegate = this.renderDelegate || Control.renderDelegate;

			// the render delegate acts on the control
			delegate.render(this);

			return this;
		},

		/**
		* Take this control and drop it into a (new/different) [DOM node]{@link external:Node}. This
		* replaces any existing [nodes]{@link external:Node} in the target _parentNode_.
		*
		* @param {Node} parentNode The new parent of this control.
		* @returns {this} Callee for chaining.
		* @public
		*/
		renderInto: function (parentNode) {
			var delegate = this.renderDelegate || Control.renderDelegate,
				noFit = this.fit === false;

			// attempt to retrieve the parentNode
			parentNode = enyo.dom.byId(parentNode);

			// teardown in case of previous render
			delegate.teardownRender(this);

			if (parentNode == document.body && !noFit) this.setupBodyFitting();
			else if (this.fit) this.addClass('enyo-fit enyo-clip');

			// for IE10 support, we want full support over touch actions in enyo-rendered areas
			this.addClass('enyo-no-touch-action');

			// add css to enable hw-accelerated scrolling on non-android platforms
			// ENYO-900, ENYO-901
			this.setupOverflowScrolling();

			// if there are unflushed body classes we flush them now...
			enyo.dom.flushBodyClasses();

			// we inject this as a root view because, well, apparently that is just an assumption
			// we've been making...
			enyo.addToRoots(this);

			// now let the delegate render it the way it needs to
			delegate.renderInto(this, parentNode);

			enyo.dom.updateScaleFactor();

			return this;
		},

		/**
		* A function that fires after the control has rendered. This preforms a
		* [reflow]{@link enyo.Control.reflow}.
		*
		* @public
		*/
		rendered: function () {
			var child,
				i = 0;

			// CAVEAT: Currently we use one entry point ('reflow') for
			// post-render layout work *and* post-resize layout work.
			this.reflow();

			for (; (child = this.children[i]); ++i) {
				if (child.generated) child.rendered();
			}
		},

		/**
		* @private
		*/
		teardownRender: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;

			delegate.teardownRender(this);
		},

		/**
		* @private
		*/
		teardownChildren: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;

			delegate.teardownChildren(this);
		},

		/**
		* @private
		*/
		addNodeToParent: function () {
			var pn;

			if (this.node) {
				pn = this.getParentNode();
				if (pn) {
					if (this.addBefore !== undefined) {
						this.insertNodeInParent(pn, this.addBefore && this.addBefore.hasNode());
					} else this.appendNodeToParent(pn);
				}
			}
		},

		/**
		* @private
		*/
		appendNodeToParent: function(parentNode) {
			parentNode.appendChild(this.node);
		},

		/**
		* @private
		*/
		insertNodeInParent: function(parentNode, beforeNode) {
			parentNode.insertBefore(this.node, beforeNode || parentNode.firstChild);
		},

		/**
		* @private
		*/
		removeNodeFromDom: function() {
			if (this.hasNode() && this.node.parentNode) {
				this.node.parentNode.removeChild(this.node);
			}
		},

		/**
		* @private
		*/
		getParentNode: function () {
			return this.parentNode || (this.parent && (
				this.parent.hasNode() || this.parent.getParentNode())
			);
		},

		// .................................

		/**
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				var attrs = props && props.attributes;

				// ensure that we both keep an instance copy of defined attributes but also
				// update the hash with any additional instance definitions at runtime
				this.attributes = this.attributes ? enyo.clone(this.attributes) : {};
				if (attrs) {
					enyo.mixin(this.attributes, attrs);
					delete  props.attributes;
				}

				return sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function (props) {
				var classes;

				// initialize the styles for this instance
				this.style = this.kindStyle + this.style;

				// super initialization
				sup.apply(this, arguments);

				// ensure that if we aren't showing -> true then the correct style
				// is applied - note that there might be issues with this because we are
				// trying not to have to parse out any other explicit display value during
				// initialization and we can't check because we haven't rendered yet
				if (!this.showing) this.style += ' display: none;';

				// try and make it so we only need to call the method once during
				// initialization and only then when we have something to add
				classes = this.kindClasses;
				if (classes && this.classes) classes += (' ' + this.classes);
				else if (this.classes) classes = this.classes;

				// if there are known classes needed to be applied from the kind
				// definition and the instance definition (such as a component block)
				this.classes = this.attributes['class'] = classes ? classes.trim() : classes;

				// setup the id for this control if we have one
				this.idChanged();
				this.contentChanged();
			};
		}),

		/**
		* Destroys the control and removes it from the [DOM]{@link external:DOM}. Also removes the
		* ability for this control to receive bubbled events.
		*
		* @public
		*/
		destroy: enyo.inherit(function (sup) {
			return function() {
				// if the control has been rendered we ensure it is removed from the DOM
				this.removeNodeFromDom();

				// ensure no other bubbled events can be dispatched to this control
				enyo.$[this.id] = null;
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		dispatchEvent: enyo.inherit(function (sup) {
			return function (name, event, sender) {
				// prevent dispatch and bubble of events that are strictly internal (e.g.
				// enter/leave)
				if (this.strictlyInternalEvents[name] && this.isInternalEvent(event)) {
					return true;
				}
				return sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		addChild: enyo.inherit(function (sup) {
			return function (control) {
				control.addClass(this.controlClasses);
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		removeChild: enyo.inherit(function (sup) {
			return function (control) {
				sup.apply(this, arguments);
				control.removeClass(this.controlClasses);
			};
		}),

		// .................................
		// BACKWARDS COMPATIBLE API, LEGACY METHODS AND PUBLIC PROPERTY
		// METHODS OR PROPERTIES THAT PROBABLY SHOULD NOT BE HERE BUT ARE ANYWAY

		/**
		* Apparently used by Ares 2 still but we have the property embedded in the kind...
		*
		* @deprecated
		* @private
		*/
		isContainer: false,

		/**
		* @private
		*/
		rtl: false,

		/**
		* @private
		*/
		setupBodyFitting: function () {
			enyo.dom.applyBodyFit();
			this.addClass('enyo-fit enyo-clip');
		},

		/*
		* If the platform is Android or Android-Chrome, don't include the css rule
		* _-webkit-overflow-scrolling: touch_, as it is not supported in Android and leads to
		* overflow issues (ENYO-900 and ENYO-901). Similarly, BB10 has issues repainting
		* out-of-viewport content when _-webkit-overflow-scrolling_ is used (ENYO-1396).
		*
		* @private
		*/
		setupOverflowScrolling: function () {
			if(enyo.platform.android || enyo.platform.androidChrome || enyo.platform.blackberry) {
				return;
			}
			enyo.dom.addBodyClass('webkitOverflowScrolling');
		},

		/**
		* Sets the control's directionality based on its content.
		*
		* @private
		*/
		detectTextDirectionality: function () {
			if (this.content && this.content.length) {
				this.rtl = enyo.isRtl(this.content);
				this.applyStyle('direction', this.rtl ? 'rtl' : 'ltr');
			}
		},

		// .................................

		// .................................
		// DEPRECATED

		/**
		* @deprecated
		* @public
		*/
		getTag: function () {
			return this.tag;
		},

		/**
		* @deprecated
		* @public
		*/
		setTag: function (tag) {
			var was = this.tag;

			if (tag && typeof tag == 'string') {
				this.tag = tag;
				if (was !== tag) this.notify('tag', was, tag);
			}
			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getAttributes: function () {
			return this.attributes;
		},

		/**
		* @deprecated
		* @public
		*/
		setAttributes: function (attrs) {
			var was = this.attributes;

			if (typeof attrs == 'object') {
				this.attributes = attrs;
				if (attrs !== was) this.notify('attributes', was, attrs);
			}

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getClasses: function () {
			return this.classes;
		},

		/**
		* @deprecated
		* @public
		*/
		setClasses: function (classes) {
			var was = this.classes;

			this.classes = classes;
			if (was != classes) this.notify('classes', was, classes);

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getStyle: function () {
			return this.style;
		},

		/**
		* @deprecated
		* @public
		*/
		setStyle: function (style) {
			var was = this.style;

			this.style = style;
			if (was != style) this.notify('style', was, style);

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getContent: function () {
			return this.content;
		},

		/**
		* @deprecated
		* @public
		*/
		setContent: function (content) {
			var was = this.content;
			this.content = content;

			if (was != content) this.notify('content', was, content);

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getShowing: function () {
			return this.showing;
		},

		/**
		* @deprecated
		* @public
		*/
		setShowing: function (showing) {
			var was = this.showing;
			this.showing = showing;

			if (was != showing) this.notify('showing', was, showing);

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getAllowHtml: function () {
			return this.allowHtml;
		},

		/**
		* @deprecated
		* @public
		*/
		setAllowHtml: function (allow) {
			var was = this.allowHtml;
			this.allowHtml = !! allow;

			if (was !== allow) this.notify('allowHtml', was, allow);

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getCanGenerate: function () {
			return this.canGenerate;
		},

		/**
		* @deprecated
		* @public
		*/
		setCanGenerate: function (can) {
			var was = this.canGenerate;
			this.canGenerate = !! can;

			if (was !== can) this.notify('canGenerate', was, can);

			return this;
		},

		/**
		* @deprecated
		* @public
		*/
		getFit: function () {
			return this.fit;
		},

		/**
		* @deprecated
		* @public
		*/
		setFit: function (fit) {
			var was = this.fit;
			this.fit = !! fit;

			if (was !== fit) this.notify('fit', was, fit);

			return this;
		},

		/**
		* @ares
		* @deprecated
		* @public
		*/
		getIsContainer: function () {
			return this.isContainer;
		},

		/**
		* @ares
		* @deprecated
		* @public
		*/
		setIsContainer: function (isContainer) {
			var was = this.isContainer;
			this.isContainer = !! isContainer;

			if (was !== isContainer) this.notify('isContainer', was, isContainer);

			return this;
		}

		// .................................

	});

	/**
	* @static
	* @public
	*/
	enyo.defaultCtor = Control;

	/**
	* @static
	* @public
	*/
	Control.renderDelegate = HTMLStringDelegate;

	/**
	* @private
	*/
	Control.registerDomEvents = function (id, control) {
		enyo.$[id] = control;
	};

	/**
	* @private
	*/
	Control.unregisterDomEvents = function (id) {
		enyo.$[id] = null;
	};

	/**
	* @private
	*/
	Control.normalizeCssStyleString = function (style) {
		return style ? (
			(";" + style)
			// add a semi-colon if it's not the last character (also trim possible unnecessary whitespace)
			.replace(/([^;])\s*$/, "$1;")
			// ensure we have one space after each colon or semi-colon
			.replace(/\s*;\s*([\w-]+)\s*:\s*/g, "; $1: ")
			// remove first semi-colon and space
			.substr(2).trim()
		) : "";
	};

	/**
	* @private
	*/
	Control.concat = function (ctor, props, instance) {
		var proto = ctor.prototype || ctor,
			attrs,
			str;

		if (props.classes) {
			if (instance) {
				str = (proto.classes ? (proto.classes + ' ') : '') + props.classes;
				proto.classes = str;
			} else {
				str = (proto.kindClasses || '') + (proto.classes ? (' ' + proto.classes) : '');
				proto.kindClasses = str;
				proto.classes = props.classes;
			}
			delete props.classes;
		}

		if (props.style) {
			if (instance) {
				str = (proto.style ? (proto.style + ';') : '') + (props.style + ';');
				proto.style = Control.normalizeCssStyleString(str);
			} else {
				str = proto.kindStyle ? proto.kindStyle : '';
				str += proto.style ? (';' + proto.style) : '';
				str += props.style;

				// moved it all to kindStyle so that it will be available whenever instanced
				proto.kindStyle = Control.normalizeCssStyleString(str);
			}
			delete props.style;
		}

		if (props.attributes) {
			attrs = proto.attributes;
			proto.attributes = attrs ? enyo.mixin({}, [attrs, props.attributes]) : props.attributes;
			delete props.attributes;
		}
	};

})(enyo, this);