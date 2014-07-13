(function (enyo, scope) {
	
	/**
	
		NOTES:
	
		Removed 'src' support as shortcut to access/set attributes.src nodeAttribute in favor of
		a change in enyo.Binding that will allow the same behavior for all attributes...(TODO)
	
		Removed 'write' method.
	
		Removed all support for renderReusingNode.
	
		Reduced initialization callstack by removing overloaded constructor method.
	
		Removed need for 'initStyles' method or calling it from 'create' method
	
		Reduced initialization callstack by not unnecessarily calling some changed handlers and
		class string initialization methods
	
		Removed setClasses overloaded method in preference for set('classes' ...) because this
		allowed a normalized and more efficient way of managing them via the addClass API
	
		Possible modification to previous (INCONSISTENT) behavior of addClass that added to the
		node but did not update the instance 'classes' property so they did not have the same
		entry point to updating the DOM and hasClass would fail because they were synchronized -
		now they are and they both use the same entry point to update the DOM which normalizes how
		Bindings can interact with them and the possibility of improved perforance in a runloop
	
		getAttribute no longer attempts to retrieve the value from the node if we have a fixed
		value for it already because it means we set it and there is no need to query the DOM
	
		remove getCssText method as it is unnecessary just call get('cssText') or access the property
		directly knowing that style is synchronized to this value as long as the control has been
		rendered
	
		remove getCssClasses method for the same reasons as getCssText method
	*/
	
	var kind = enyo.kind;
	
	var UiComponent = enyo.UiComponent,
		HTMLStringDelegate = enyo.HTMLStringDelegate;
	
	/**
		@public
		@class enyo.Control
		@extends enyo.UiComponent
	*/
	var Control = kind(
		/** @lends enyo.Control.prototype */ {
	
		/**
			@private
		*/
		name: 'enyo.Control',
		
		/**
			@private
		*/
		kind: UiComponent,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			@public
		*/
		defaultKind: 'enyo.Control',
		
		/**
			@public
		*/
		tag: 'div',
		
		/**
			@public
		*/
		attributes: null,
		
		/**
			@public
		*/
		fit: null,
		
		/**
			@public
		*/
		allowHtml: false,
		
		/**
			@public
		*/
		style: '',
		
		/**
			@private
		*/
		kindStyle: '',
		
		/**
			@public
		*/
		classes: '',
		
		/**
			@private
		*/
		kindClasses: '',
		
		/**
			@public
		*/
		controlClasses: '',
		
		/**
			@public
		*/
		content: '',
		
		/**
			@public
		*/
		renderOnShow: false,

		/**
			@public
		*/
		handlers: {
			ontap: 'tap',
			onShowingChanged: 'showingChangedHandler'
		},
		
		/**
			@private
		*/
		strictlyInternalEvents: {onenter: 1, onleave: 1},
		
		/**
			@private
		*/
		isInternalEvent: function (event) {
			var rdt = enyo.dispatcher.findDispatchTarget(event.relatedTarget);
			return rdt && rdt.isDescendantOf(this);
		},
		
		// .................................
		// DOM NODE MANIPULATION API
		
		/**
			@public
		*/
		getBounds: function () {
			var node = this.hasNode(),
				bounds = node && enyo.dom.getBounds(node);
			
			return bounds || {left: undefined, top: undefined, width: undefined, height: undefined};
		},
		
		/**
			@public
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
			@public
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
			@public
		*/
		show: function () {
			this.set('showing', true);
		},
		
		/**
			@public
		*/
		hide: function () {
			this.set('showing', false);
		},
		
		/**
			@public
		*/
		focus: function () {
			if (this.hasNode()) this.node.focus();
		},
		
		/**
			@public
		*/
		blur: function () {
			if (this.hasNode()) this.node.blur();
		},
		
		/**
			@public
		*/
		hasFocus: function () {
			if (this.hasNode()) return document.activeElement === this.node;
		},
		
		/**
			@public
		*/
		hasNode: function () {
			return this.generated && (this.node || this.findNodeById());
		},
		
		/**
			@public
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
			@public
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
			@public
		*/
		getNodeProperty: function (name, def) {
			return this.hasNode() ? this.node[name] : def;
		},
		
		/**
			@public
		*/
		setNodeProperty: function (name, value) {
			if (this.hasNode()) this.node[name] = value;
			return this;
		},
		
		/**
			@public
		*/
		addContent: function (content) {
			return this.set('content', this.get('content') + content);
		},
		
		// .................................
		
		// .................................
		// STYLE/CLASS API
		
		/**
			@public
		*/
		hasClass: function (name) {
			return name && (' ' + this.classes + ' ').indexOf(' ' + name + ' ') > -1;
		},
		
		/**
			@public
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
			@public
		*/
		removeClass: function (name) {
			var classes = this.classes;
			
			if (name) {
				this.set('classes', (' ' + classes + ' ').replace(' ' + name + ' ', ' ').trim());
			}
			
			return this;
		},
		
		/**
			@public
		*/
		addRemoveClass: function (name, add) {
			return name ? this[add ? 'addClass' : 'removeClass'](name) : this;
		},
		
		/**
			@private
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
			@public
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
						// this looks a lot worse than it is the complexity stems from needing to
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
			@public
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
			@private
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
			@public
		*/
		getComputedStyleValue: function (prop, def) {
			return this.hasNode() ? enyo.dom.getComputedStyleValue(this.node, prop) : def;
		},
		
		/**
			@private
		*/
		findNodeById: function () {
			return this.id && (this.node = enyo.dom.byId(this.id));
		},
		
		/**
			@private
		*/
		idChanged: function (was) {
			if (was) Control.unregisterDomEvents(was);
			if (this.id) {
				Control.registerDomEvents(this.id, this);
				this.setAttribute('id', this.id);
			}
		},
		
		/**
			@private
		*/
		contentChanged: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;
			delegate.invalidate(this, 'content');
		},

		/**
			If developer would like to delay rendering of control until it called to show,
			set renderOnShow to true.
			It means that _canGenerate_ becomes false and will be true 
			when you set showing to true

			@private
		*/
		renderOnShowChanged: function () {
			if (!this.hasNode()) this.showing = false;
			this.setCanGenerate(!this.renderOnShow);
		},
		
		/**
			@public
		*/
		beforeChildRender: function () {
			// if we are generated, we should flow before rendering a child;
			// if not, the render context isn't ready anyway
			if (this.generated) this.flow();
		},
		
		/**
			@private
		*/
		showingChanged: function (was) {
			
			// if we are changing from not showing to showing we attempt to find whatever
			// our last known value for display was or use the default
			if (!was) {
				this.applyStyle('display', this._display || '');
				// If renderOnShow is true and generated is false then
				// develper intended to make this control un-rendered 
				// until there is a request to show
				if (this.renderOnShow && !this.generated) {
					this.setCanGenerate = true;
					this.render();
				}
			}			
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
			@private
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
			Returns true if this and all parents are showing. If the optional _ignoreBounds_ boolean
			parameter is `true` it will not force a layout by retrieving computed bounds and rely on
			the return from _this.showing_ exclusively.
		
			@public
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
			Handles the _onshowingchanged_ event that is waterfalled by controls when their
			_showing_ value is modified. If the control is not showing itself already it will not
			continue the waterfall. Overload this method for additional handling of this event.
		
			@private
		*/
		showingChangedHandler: function (sender, event) {
			return sender === this ? false : !this.showing;
		},
		
		/**
			@private
		*/
		fitChanged: function () {
			this.parent.reflow();
		},
		
		/**
			@public
		*/
		isFullscreen: function () {
			return (this.hasNode() && this.node === enyo.fullscreen.getFullscreenElement());
		},
		
		/**
			@public
		*/
		requestFullscreen: function () {
			if (!this.hasNode()) return false;

			if (enyo.fullscreen.requestFullscreen(this)) {
				return true;
			}

			return false;
		},
		
		/**
			@public
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
			@public
		*/
		canGenerate: true,
		
		/**
			@public
		*/
		showing: true,
		
		/**
			@public
		*/
		renderDelegate: null,
		
		/**
			@private
		*/
		generated: false,
		
		/**
			@public
			@method
		*/
		render: function () {
			
			// prioritize the delegate set for this control otherwise use the default
			var delegate = this.renderDelegate || Control.renderDelegate;
			
			// the render delegate acts on the control
			delegate.render(this);
			
			return this;
		},
		
		/**
			@public
			@method
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
			@public
			@method
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
			@private
		*/
		teardownRender: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;
			
			delegate.teardownRender(this);
		},
		
		/**
			@private
		*/
		teardownChildren: function () {
			var delegate = this.renderDelegate || Control.renderDelegate;
			
			delegate.teardownChildren(this);
		},
		
		/**
			@private
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
			@private
		*/
		appendNodeToParent: function(parentNode) {
			parentNode.appendChild(this.node);
		},
		
		/**
			@private
		*/
		insertNodeInParent: function(parentNode, beforeNode) {
			parentNode.insertBefore(this.node, beforeNode || parentNode.firstChild);
		},
		
		/**
			@private
		*/
		removeNodeFromDom: function() {
			if (this.hasNode() && this.node.parentNode) {
				this.node.parentNode.removeChild(this.node);
			}
		},
		
		/**
			@private
		*/
		getParentNode: function () {
			return this.parentNode || (this.parent && (
				this.parent.hasNode() || this.parent.getParentNode())
			);
		},
		
		// .................................
		
		/**
			@private
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
			@private
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
				this.renderOnShowChanged();
			};
		}),
		
		/**
			@public
			@method
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
			@private
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
			@private
		*/
		addChild: enyo.inherit(function (sup) {
			return function (control) {
				control.addClass(this.controlClasses);
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
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
			Apparently used by Ares 2 still but we have the property embedded in the kind...
		
			@private
			@deprecated
		*/
		isContainer: false,
		
		/**
			@private
		*/
		rtl: false,
		
		/**
			@private
		*/
		setupBodyFitting: function () {
			enyo.dom.applyBodyFit();
			this.addClass('enyo-fit enyo-clip');
		},
		
		/*
			If the platform is Android or Android-Chrome, don't include the css rule
			_-webkit-overflow-scrolling: touch_, as it is not supported in Android and leads to
			overflow issues (ENYO-900 and ENYO-901). Similarly, BB10 has issues repainting
			out-of-viewport content when _-webkit-overflow-scrolling_ is used (ENYO-1396).
		
			@private
		*/
		setupOverflowScrolling: function () {
			if(enyo.platform.android || enyo.platform.androidChrome || enyo.platform.blackberry) {
				return;
			}
			enyo.dom.addBodyClass('webkitOverflowScrolling');
		},
		
		/**
			Sets the control's directionality based on its content.
			
			@private
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
			@public
			@deprecated
		*/
		getTag: function () {
			return this.tag;
		},
		
		/**
			@public
			@deprecated
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
			@public
			@deprecated
		*/
		getAttributes: function () {
			return this.attributes;
		},
		
		/**
			@public
			@deprecated
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
			@public
			@deprecated
		*/
		getClasses: function () {
			return this.classes;
		},
		
		/**
			@public
			@deprecated
		*/
		setClasses: function (classes) {
			var was = this.classes;
			
			this.classes = classes;
			if (was != classes) this.notify('classes', was, classes);
			
			return this;
		},
		
		/**
			@public
			@deprecated
		*/
		getStyle: function () {
			return this.style;
		},
		
		/**
			@public
			@deprecated
		*/
		setStyle: function (style) {
			var was = this.style;
			
			this.style = style;
			if (was != style) this.notify('style', was, style);
			
			return this;
		},
		
		/**
			@public
			@deprecated
		*/
		getContent: function () {
			return this.content;
		},
		
		/**
			@public
			@deprecated
		*/
		setContent: function (content) {
			var was = this.content;
			this.content = content;
			
			if (was != content) this.notify('content', was, content);
			
			return this;
		},
		/**
			@public
			@deprecated
		*/
		getRenderOnShow: function () {
			return this.renderOnShow;
		},
		
		/**
			@public
			@deprecated
		*/
		setRenderOnShow: function (can) {
			var was = this.renderOnShow;
			this.renderOnShow = can;
			
			if (was !== can) this.notify('canRenderOnShow', was, can);
			
			return this;
		},
		
		/**
			@public
			@deprecated
		*/
		getShowing: function () {
			return this.showing;
		},
		
		/**
			@public
			@deprecated
		*/
		setShowing: function (showing) {
			var was = this.showing;
			this.showing = showing;
			
			if (was != showing) this.notify('showing', was, showing);
			
			return this;
		},
		
		/**
			@public
			@deprecated
		*/
		getAllowHtml: function () {
			return this.allowHtml;
		},
		
		/**
			@public
			@deprecated
		*/
		setAllowHtml: function (allow) {
			var was = this.allowHtml;
			this.allowHtml = !! allow;
			
			if (was !== allow) this.notify('allowHtml', was, allow);
			
			return this;
		},
		
		/**
			@public
			@deprecated
		*/
		getCanGenerate: function () {
			return this.canGenerate;
		},
		
		/**
			@public
			@deprecated
		*/
		setCanGenerate: function (can) {
			var was = this.canGenerate;
			this.canGenerate = !! can;
			
			if (was !== can) this.notify('canGenerate', was, can);
			
			return this;
		},
		
		/**
			@public
			@deprecated
		*/
		getFit: function () {
			return this.fit;
		},
		
		/**
			@public
			@deprecated
		*/
		setFit: function (fit) {
			var was = this.fit;
			this.fit = !! fit;
			
			if (was !== fit) this.notify('fit', was, fit);
			
			return this;
		},
		
		/**
			@public
			@deprecated
			@ares
		*/
		getIsContainer: function () {
			return this.isContainer;
		},
		
		/**
			@public
			@deprecated
			@ares
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
		@public
		@static
	*/
	enyo.defaultCtor = Control;
	
	/**
		@public
		@static
	*/
	Control.renderDelegate = HTMLStringDelegate;
	
	/**
		@private
	*/
	Control.registerDomEvents = function (id, control) {
		enyo.$[id] = control;
	};
	
	/**
		@private
	*/
	Control.unregisterDomEvents = function (id) {
		enyo.$[id] = null;
	};
	
	/**
		@private
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
		@private
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
