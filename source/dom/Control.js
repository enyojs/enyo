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
	
	*/
	
	var kind = enyo.kind;
	
	var UiComponent = enyo.UiComponent;
	
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
		handlers: {
			ontap: 'tap',
			onShowingChanged: 'showingChangedHandler'
		},
		
		// .................................
		// DOM NODE MANIPULATION API
		
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
			// TODO: This is a fixed API assuming that no changes will happen to the DOM that
			// do not use it...original implementation of this method used the node's own
			// getAttribute method if it existed but it doesn't seem possible for them to get
			// out of sync...
			return this.attributes[name];
		},
		
		/**
			@public
		*/
		setAttribute: function (name, value) {
			return this.set('attributes.' + name, value);
		},
		
		/**
			@public
		*/
		getNodeProperty: function (name, def) {
			var node = this.hasNode();
			return node ? node[name] : def;
		},
		
		/**
			@public
		*/
		setNodeProperty: function (name, value) {
			var node = this.hasNode();
			if (node) node[name] = value;
			return this;
		},
		
		// .................................
		
		// .................................
		// STYLE/CLASS API
		
		/**
			@public
		*/
		hasClass: function (name) {
			return name && ((this.attributes['class'] || '').indexOf(name) > -1);
		},
		
		/**
			@public
		*/
		addClass: function (name) {
			var classes;
			
			if (!this.hasClass(name)) {
				classes = this.classes;
				this.classes += ((this.classes ? ' ' : '') + name);
				this.classesChanged(classes, this.classes);
			}
			
			return this;
		},
		
		/**
			@public
		*/
		removeClass: function (name) {
			
		},
		
		/**
			@public
		*/
		addRemoveClass: function (name, add) {
			
		},
		
		/**
			@private
		*/
		classesChanged: function (was) {
			if (was) this.removeClass(was);
			if (this.classes) this.addClass(this.classes);
		},
		
		/**
			@private
		*/
		styleChanged: function () {
			
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
		},
		
		/**
			@public
			@method
		*/
		renderInto: function (parentNode) {
			
		},
		
		/**
			@public
			@method
		*/
		rendered: function () {
			
		},
		
		// .................................
		
		/**
			@private
		*/
		create: enyo.inherit(function (sup) {
			return function (props) {
				var attrs = props && props.attributes,
					style,
					classes;
				
				// ensure that we both keep an instance copy of defined attributes but also
				// update the hash with any additional instance definitions at runtime
				this.attributes = this.attributes ? enyo.clone(this.attributes) : {};
				if (attrs) {
					enyo.mixin(this.attributes, attrs);
					delete  props.attributes;
				}
				
				// initialize the styles for this instance
				this.domStyles = this.domStyles ? enyo.clone(this.domStyles) : {};
				style = this.kindStyle + this.style;
				if (style) Control.cssTextToDomStyles(style, this.domStyles);
				
				// check to ensure that the showing property is flagged (implicitly) from the
				// display value of a style entry if necessary
				if (this.domStyles.display == 'none') {
					this.showing = false;
					this.domStyles.display = '';
				}
				
				// super initialization
				sup.apply(this, arguments);
				
				// initialize/synchronize the showing property
				this.showingChanged();
				
				// try and make it so we only need to call the method once during
				// initialization and only then when we have something to add
				classes = this.kindClasses;
				if (classes && this.classes) classes += (' ' + this.classes);
				else if (this.classes) classes = this.classes;
				
				// if there are known classes needed to be applied from the kind
				// definition and the instance definition (such as a component block)
				if (classes) this.addClass(classes);
				
				// setup the id for this control if we have one
				this.idChanged();
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
		rtl: false
		
		// .................................
	});
	
})(enyo, this);