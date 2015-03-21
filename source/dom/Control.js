(function (enyo, scope) {

	var kind = enyo.kind;

	var UiComponent = enyo.UiComponent,
		HTMLStringDelegate = enyo.HTMLStringDelegate;

	var nodePurgatory;

	/**
	* Called by `Control.teardownRender()`. In certain circumstances,
	* we need to temporarily keep a DOM node around after tearing down
	* because we're still acting on a stream of touch events emanating
	* from the node. See `Control.retainNode()` for more information.
	*
	* @private
	*/
	function storeRetainedNode (control) {
		var p = getNodePurgatory(),
			n = control._retainedNode;
		if (n) {
			p.appendChild(n);
		}
		control._retainedNode = null;
	}

	/**
	* Called (via a callback) when it's time to release a DOM node
	* that we've retained.
	*
	* @private
	*/
	function releaseRetainedNode (retainedNode) {
		var p = getNodePurgatory();
		if (retainedNode) {
			p.removeChild(retainedNode);
		}
	}

	/**
	* Lazily add a hidden `<div>` to `document.body` to serve as a
	* container for retained DOM nodes.
	*
	* @private
	*/
	function getNodePurgatory () {
		var p = nodePurgatory;
		if (!p) {
			p = nodePurgatory = document.createElement("div");
			p.id = "node_purgatory";
			p.style.display = "none";
			document.body.appendChild(p);
		}
		return p;
	}

	/**
	* {@link enyo.Control} is a [component]{@link enyo.UiComponent} that controls
	* a [DOM]{@glossary DOM} [node]{@glossary Node} (i.e., an element in the user
	* interface). Controls are generally visible and the user often interacts with
	* them directly. While things like buttons and input boxes are obviously
	* controls, in Enyo, a control may be as simple as a text item or as complex
	* as an entire application. Both inherit the same basic core capabilities from
	* this kind.
	*
	* For more information, see the documentation on
	* [Controls]{@linkplain $dev-guide/key-concepts/controls.html} in the
	* Enyo Developer Guide.
	*
	* **If you make changes to `enyo.Control`, be sure to add or update the
	* appropriate unit tests.**
	*
	* @class enyo.Control
	* @extends enyo.UiComponent
	* @ui
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
		* The [DOM node]{@glossary DOM} tag name that should be created.
		*
		* @type {String}
		* @default 'div'
		* @public
		*/
		tag: 'div',

		/**
		* A [hash]{@glossary Object} of attributes to be applied to the created
		* [DOM]{@glossary DOM} node.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		attributes: null,

		/**
		* [Boolean]{@glossary Boolean} flag indicating whether this element should
		* "fit", or fill its container's size.
		*
		* @type {Boolean}
		* @default null
		* @public
		*/
		fit: null,

		/**
		* [Boolean]{@glossary Boolean} flag indicating whether HTML is allowed in
		* this control's [content]{@link enyo.Control#content} property. If `false`
		* (the default), HTML will be encoded into [HTML entities]{@glossary entity}
		* (e.g., `&lt;` and `&gt;`) for literal visual representation.
		*
		* @type {Boolean}
		* @default null
		* @public
		*/
		allowHtml: false,

		/**
		* Mimics the HTML `style` attribute.
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
		* Mimics the HTML `class` attribute.
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
		* [Classes]{@link enyo.Control#classes} that are applied to all controls.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		controlClasses: '',

		/**
		* The text-based content of the Control. If the [allowHtml]{@link enyo.Control#allowHtml}
		* flag is set to `true`, you may set this property to an HTML string.
		* @public
		*/
		content: '',

		/**
		* If true or 'inherit' and enyo.gesture.doubleTabEnabled == true, will fire a doubletap
		* event, and will temporarily suppress a single tap while waiting for a double tap.
		*
		* @type {String|Boolean}
		* @default 'inherit'
		* @public
		*/
		doubleTapEnabled: 'inherit',

		/**
		* Time in milliseconds to wait to detect a double tap
		*
		* @type {Number}
		* @default 300
		* @public
		*/
		doubleTapInterval: 300,

		/**
		* If set to `true`, the [control]{@link enyo.Control} will not be rendered until its
		* [showing]{@link enyo.Control#showing} property has been set to `true`. This can be used
		* directly or is used by some widgets to control when children are rendered.
		*
		* It is important to note that setting this to `true` will _force_
		* [canGenerate]{@link enyo.Control#canGenerate} and [showing]{@link enyo.Control#showing}
		* to be `false`. Arbitrarily modifying the values of these properties prior to its initial
		* render may have unexpected results.
		*
		* Once a control has been shown/rendered with `renderOnShow` `true` the behavior will not
		* be used again.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		renderOnShow: false,

		/**
		* @todo Find out how to document "handlers".
		* @public
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
		* Gets the bounds for this control. The `top` and `left` properties returned
		* by this method represent the control's positional distance in pixels from
		* either A) the first parent of this control that is absolutely or relatively
		* positioned, or B) the `document.body`.
		*
		* This is a shortcut convenience method for {@link enyo.dom.getBounds}.
		*
		* @returns {Object} An [object]{@glossary Object} containing `top`, `left`,
		* `width`, and `height` properties.
		* @public
		*/
		getBounds: function () {
			var node = this.hasNode(),
				bounds = node && enyo.dom.getBounds(node);

			return bounds || {left: undefined, top: undefined, width: undefined, height: undefined};
		},

		/**
		* Sets the absolute/relative position and/or size for this control. Values
		* of `null` or `undefined` for the `bounds` properties will be ignored. You
		* may optionally specify a `unit` (i.e., a valid CSS measurement unit) as a
		* [string]{@glossary String} to be applied to each of the position/size
		* assignments.
		*
		* @param {Object} bounds - An [object]{@glossary Object}, optionally
		* containing one or more of the following properties: `width`, `height`,
		* `top`, `right`, `bottom`, and `left`.
		* @param {String} [unit='px']
		* @public
		*/
		setBounds: function (bounds, unit) {
			var newStyle = '',
				extents = ['width', 'height', 'left', 'top', 'right', 'bottom'],
				i = 0,
				val,
				ext;

			// if no unit is supplied, we default to pixels
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
		* Gets the bounds for this control. The `top` and `left` properties returned
		* by this method represent the control's positional distance in pixels from
		* `document.body`. To get the bounds relative to this control's parent(s),
		* use [getBounds()]{@link enyo.Control#getBounds}.
		*
		* This is a shortcut convenience method for {@link enyo.dom.getAbsoluteBounds}.
		*
		* @returns {Object} An [object]{@glossary Object} containing `top`, `left`,
		* `width`, and `height` properties.
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
		* Shortcut method to set [showing]{@link enyo.Control#showing} to `true`.
		*
		* @public
		*/
		show: function () {
			this.set('showing', true);
		},

		/**
		* Shortcut method to set [showing]{@link enyo.Control#showing} to `false`.
		*
		* @public
		*/
		hide: function () {
			this.set('showing', false);
		},

		/**
		* Sets this control to be [focused]{@glossary focus}.
		*
		* @public
		*/
		focus: function () {
			if (this.hasNode()) this.node.focus();
		},

		/**
		* [Blurs]{@glossary blur} this control. (The opposite of
		* [focus()]{@link enyo.Control#focus}.)
		*
		* @public
		*/
		blur: function () {
			if (this.hasNode()) this.node.blur();
		},

		/**
		* Determines whether this control currently has the [focus]{@glossary focus}.
		*
		* @returns {Boolean} Whether this control has focus. `true` if the control
		* has focus; otherwise, `false`.
		* @public
		*/
		hasFocus: function () {
			if (this.hasNode()) return document.activeElement === this.node;
		},

		/**
		* Determines whether this control's [DOM node]{@glossary Node} has been created.
		*
		* @returns {Boolean} Whether this control's [DOM node]{@glossary Node} has
		* been created. `true` if it has been created; otherwise, `false`.
		* @public
		*/
		hasNode: function () {
			return this.generated && (this.node || this.findNodeById());
		},

		/**
		* Gets the requested property (`name`) from the control's attributes
		* [hash]{@glossary Object}, from its cache of node attributes, or, if it has
		* yet to be cached, from the [node]{@glossary Node} itself.
		*
		* @param {String} name - The attribute name to get.
		* @returns {(String|Null)} The value of the requested attribute, or `null`
		* if there isn't a [DOM node]{@glossary Node} yet.
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
		* Assigns an attribute to a control's [node]{@glossary Node}. Assigning
		* `name` a value of `null`, `false`, or the empty string `("")` will remove
		* the attribute from the node altogether.
		*
		* @param {String} name - Attribute name to assign/remove.
		* @param {(String|Number|null)} value - The value to assign to `name`
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
		* Reads the `name` property directly from the [node]{@glossary Node}. You
		* may provide a default (`def`) to use if there is no node yet.
		*
		* @param {String} name - The [node]{@glossary Node} property name to get.
		* @param {*} def - The default value to apply if there is no node.
		* @returns {String} The value of the `name` property, or `def` if the node
		* was not available.
		* @public
		*/
		getNodeProperty: function (name, def) {
			return this.hasNode() ? this.node[name] : def;
		},

		/**
		* Sets the value of a property (`name`) directly on the [node]{@glossary Node}.
		*
		* @param {String} name - The [node]{@glossary Node} property name to set.
		* @param {*} value - The value to assign to the property.
		* @returns {this} The callee for chaining.
		* @public
		*/
		setNodeProperty: function (name, value) {
			if (this.hasNode()) this.node[name] = value;
			return this;
		},

		/**
		* Appends additional content to this control.
		*
		* @param {String} content - The new string to add to the end of the `content`
		* property.
		* @returns {this} The callee for chaining.
		* @public
		*/
		addContent: function (content) {
			return this.set('content', this.get('content') + content);
		},

		// .................................

		// .................................
		// STYLE/CLASS API

		/**
		* Determines whether this control has the class `name`.
		*
		* @param {String} name - The name of the class (or classes) to check for.
		* @returns {Boolean} Whether the control has the class `name`.
		* @public
		*/
		hasClass: function (name) {
			return name && (' ' + this.classes + ' ').indexOf(' ' + name + ' ') > -1;
		},

		/**
		* Adds the specified class to this control's list of classes.
		*
		* @param {String} name - The name of the class to add.
		* @returns {this} The callee for chaining.
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
		* Removes the specified class from this control's list of classes.
		*
		* **Note: It is not advisable to pass a string of multiple, space-delimited
		* class names into this method. Instead, call the method once for each class
		* name that you want to remove.**
		*
		* @param {String} name - The name of the class to remove.
		* @returns {this} The callee for chaining.
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
		* Adds or removes the specified class conditionally, based on the state
		* of the `add` argument.
		*
		* @param {String} name - The name of the class to add or remove.
		* @param {Boolean} add - If `true`, `name` will be added as a class; if
		* `false`, it will be removed.
		* @returns {this} The callee for chaining.
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
		* Applies a CSS style directly to the control. Use the `prop` argument to
		* specify the CSS property name you'd like to set, and `value` to specify
		* the desired value. Setting `value` to `null` will remove the CSS property
		* `prop` altogether.
		*
		* @param {String} prop - The CSS property to assign.
		* @param {(String|Number|null|undefined)} value - The value to assign to
		* `prop`. Setting a value of `null`, `undefined`, or the empty string `("")`
		* will remove the property `prop` from the control.
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

			// FIXME: This is put in place for a Firefox bug where setting a style value of a node
			// via its CSSStyleDeclaration object (by accessing its node.style property) does
			// not work when using a CSS property name that contains one or more dash, and requires
			// setting the property via the JavaScript-style property name. This fix should be
			// removed once this issue has been resolved in the Firefox mainline and its variants
			// (it is currently resolved in the 36.0a1 nightly):
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1083457
			if (node && (enyo.platform.firefox < 35 || enyo.platform.firefoxOS || enyo.platform.androidFirefox)) {
				prop = prop.replace(/-([a-z])/gi, function(match, submatch) {
					return submatch.toUpperCase();
				});
			}

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
						'\\s*' + prop + '\\s*:\\s*[a-zA-Z0-9\\ ()_\\-\'"%,]*(?:url\\(.*\\)\\s*[a-zA-Z0-9\\ ()_\\-\'"%,]*)?\\s*(?:;|;?$)',
						'gi'
					),'');
					this.set('style', style);
				}
			}

			return this;
		},

		/**
		* Allows the addition of several CSS properties and values at once, via a
		* single string, similar to how the HTML `style` attribute works.
		*
		* @param {String} css - A string containing one or more valid CSS styles.
		* @returns {this} The callee for chaining.
		* @public
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
		* Retrieves a control's CSS property value. This doesn't just pull the
		* assigned value of `prop`; it returns the browser's understanding of `prop`,
		* the "computed" value. If the control isn't been rendered yet, and you need
		* a default value (such as `0`), include it in the arguments as `def`.
		*
		* @param {String} prop - The property name to get.
		* @param {*} [def] - An optional default value, in case the control isn't
		* rendered yet.
		* @returns {(String|Number)} The computed value of `prop`, as the browser
		* sees it.
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
		* If the control has been generated, re-flows the control.
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
			var nextControl;
			// if we are changing from not showing to showing we attempt to find whatever
			// our last known value for display was or use the default
			if (!was && this.showing) {
				this.applyStyle('display', this._display || '');

				// note the check for generated and canGenerate as changes to canGenerate will force
				// us to ignore the renderOnShow value so we don't undo whatever the developer was
				// intending
				if (!this.generated && !this.canGenerate && this.renderOnShow) {
					nextControl = this.getNextControl();
					if (nextControl && !this.addBefore) this.addBefore = nextControl;
					this.set('canGenerate', true);
					this.render();
				}

				this.sendShowingChangedEvent(was);
			}

			// if we are supposed to be hiding the control then we need to cache our current
			// display state
			else if (was && !this.showing) {
				this.sendShowingChangedEvent(was);
				// we can't truly cache this because it _could_ potentially be set to multiple
				// values throughout its lifecycle although that seems highly unlikely...
				this._display = this.hasNode() ? this.node.style.display : '';
				this.applyStyle('display', 'none');
			}

		},

		/**
		* @private
		*/
		renderOnShowChanged: function () {
			// ensure that the default value assigned to showing is actually a boolean
			// and that it is only true if the renderOnShow is also false
			this.showing = ((!!this.showing) && !this.renderOnShow);

			// we want to check and make sure that the canGenerate value is correct given
			// the state of renderOnShow
			this.canGenerate = (this.canGenerate && !this.renderOnShow);
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
		* Returns `true` if this control and all parents are showing.
		*
		* @param {Boolean} ignoreBounds - If `true`, it will not force a layout by retrieving
		*	computed bounds and rely on the return from [showing]{@link enyo.Control#showing}
		* exclusively.
		* @returns {Boolean} Whether the control is showing (visible).
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
		* Handles the `onShowingChanged` event that is waterfalled by controls when
		* their `showing` value is modified. If the control is not showing itself
		* already, it will not continue the waterfall. Overload this method to
		* provide additional handling for this event.
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
		* Determines whether we are in fullscreen mode or not.
		*
		* @returns {Boolean} Whether we are currently in fullscreen mode.
		* @public
		*/
		isFullscreen: function () {
			return (this.hasNode() && this.node === enyo.fullscreen.getFullscreenElement());
		},

		/**
		* Requests that this control be displayed fullscreen (like a video
		* container). If the request is granted, the control fills the screen and
		* `true` is returned; if the request is denied, the control is not resized
		* and `false` is returned.
		*
		* @returns {Boolean} `true` on success; otherwise, `false`.
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
		* Ends fullscreen mode for this control.
		*
		* @returns {Boolean} If the control was in fullscreen mode before this
		* method was called, it is taken out of that mode and `true` is returned;
		* otherwise, `false` is returned.
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
		* Indicates whether the control is allowed to be generated, i.e., rendered
		* into the [DOM]{@glossary DOM} tree.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		canGenerate: true,

		/**
		* Indicates whether the control is visible.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		showing: true,

		/**
		* The [node]{@glossary Node} that this control will be rendered into.
		*
		* @type {enyo.Control}
		* @default null
		* @public
		*/
		renderDelegate: null,

		/**
		* Indicates whether the control has been generated yet.
		*
		* @type {Boolean}
		* @default false
		* @private
		*/
		generated: false,

		/**
		* Forces the control to be rendered. You should use this sparingly, as it
		* can be costly, but it may be necessary in cases where a control or its
		* contents have been updated surreptitiously.
		*
		* @returns {this} The callee for chaining.
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
		* Takes this control and drops it into a (new/different)
		* [DOM node]{@glossary Node}. This will replace any existing nodes in the
		* target `parentNode`.
		*
		* @param {Node} parentNode - The new parent of this control.
		* @param {Boolean} preventRooting - If `true`, this control will not be treated as a root
		*	view and will not be added to the set of roots.
		* @returns {this} The callee for chaining.
		* @public
		*/
		renderInto: function (parentNode, preventRooting) {
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
			if (!preventRooting) {
				enyo.addToRoots(this);
			}

			// now let the delegate render it the way it needs to
			delegate.renderInto(this, parentNode);

			enyo.dom.updateScaleFactor();

			return this;
		},

		/**
		* A function that fires after the control has rendered. This performs a
		* reflow.
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
		* You should generally not need to call this method in your app code.
		* It is used internally by some Enyo UI libraries to handle a rare
		* issue that sometimes arises when using a virtualized list or repeater
		* on a touch device.
		*
		* This issue occurs when a gesture (e.g. a drag) originates with a DOM
		* node that ends up being destroyed in mid-gesture as the list updates.
		* When the node is destroyed, the stream of DOM events representing the
		* gesture stops, causing the associated action to stop or otherwise
		* fail.
		*
		* You can prevent this problem from occurring by calling `retainNode`
		* on the {@link enyo.Control} from which the gesture originates. Doing
		* so will cause Enyo to keep the DOM node around (hidden from view)
		* until you explicitly release it. You should call `retainNode` in the
		* event handler for the event that starts the gesture.
		*
		* `retainNode` returns a function that you must call when the gesture
		* ends to release the node. Make sure you call this function to avoid
		* "leaking" the DOM node (failing to remove it from the DOM).
		*
		* @param {Node} node - Optional. Defaults to the node associated with
		* the Control (`Control.node`). You can generally omit this parameter
		* when working with {@link enyo.DataList} or {@link enyo.DataGridList},
		* but should generally pass in the event's target node (`event.target`)
		* when working with {@link enyo.List}. (Because {@link enyo.List} is
		* based on the Flyweight pattern, the event's target node is often not
		* the node currently associated with the Control at the time the event
		* occurs.)
		* @returns {Function} Keep a reference to this function and call it
		* to release the node when the gesture has ended.
		* @public
		*/
		retainNode: function(node) {
			var control = this,
				retainedNode = this._retainedNode = (node || this.hasNode());
			return function() {
				if (control && (control._retainedNode == retainedNode)) {
					control._retainedNode = null;
				} else {
					releaseRetainedNode(retainedNode);
				}
			};
		},

		/**
		* @param {Boolean} [cache] - Whether or not we are tearing down as part of a destroy
		*	operation, or if we are just caching. If `true`, the `showing` and `canGenerate`
		*	properties of the control will not be reset.
		* @private
		*/
		teardownRender: function (cache) {
			var delegate = this.renderDelegate || Control.renderDelegate;

			if (this._retainedNode) {
				storeRetainedNode(this);
			}

			delegate.teardownRender(this, cache);

			// if the original state was set with renderOnShow true then we need to reset these
			// values as well to coordinate the original intent
			if (this.renderOnShow && !cache) {
				this.set('showing', false);
				this.set('canGenerate', false);
			}
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

				// set initial values based on renderOnShow
				this.renderOnShowChanged();

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
		* Destroys the control and removes it from the [DOM]{@glossary DOM}. Also
		* removes the control's ability to receive bubbled events.
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

		/**
		* @private
		*/
		set: enyo.inherit(function (sup) {
			return function (path, value, opts) {
				// this should be updated if a better api for hooking becomes available but for
				// now we just do this directly to ensure that the showing value is actually
				// a boolean
				if (path == 'showing') {
					return sup.call(this, path, !! value, opts);
				} else return sup.apply(this, arguments);
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
		* `-webkit-overflow-scrolling: touch`, as it is not supported in Android and leads to
		* overflow issues (ENYO-900 and ENYO-901). Similarly, BB10 has issues repainting
		* out-of-viewport content when `-webkit-overflow-scrolling` is used (ENYO-1396).
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
		* Sets the control's directionality based on its content, or an optional `stringInstead`.
		*
		* @param {String} [stringInstead] An alternate string for consideration may be sent instead,
		*	in-case the string to test the directionality of the control is stored in `this.value`,
		*	or some other property, for example.
		* @private
		*/
		detectTextDirectionality: function (stringInstead) {
			// If an argument was supplied at all, use it, even if it's undefined.
			// Values that are null or undefined, or are numbers, arrays, and some objects are safe
			// to be tested.
			var str = (arguments.length) ? stringInstead : this.content;
			if (str || str === 0) {
				this.rtl = enyo.isRtl(str);
				this.applyStyle('direction', this.rtl ? 'rtl' : 'ltr');
			} else {
				this.applyStyle('direction', null);
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

			// force the showing property to always be a boolean value
			this.showing = !! showing;

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
