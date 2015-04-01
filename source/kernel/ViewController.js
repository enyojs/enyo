(function (enyo, scope) {
	/**
	* {@link enyo.ViewController} is designed to manage the lifecycle of a particular view
	* ({@link enyo.Control}) that it owns. It is capable of controlling when a view is inserted into
	* the DOM and where, managing [events]{@glossary event} bubbled from the view, and isolating (or
	* encapsulating) the entire view hierarchy below it. Alternatively, it may be implemented as a
	* [component]{@link enyo.Component} in a larger hierarchy, in which case it will inject its view
	* into its parent rather than directly into the DOM. And, of course, a ViewController may be
	* used as the `controller` property of another view, although this usage will (by default)
	* result in the removal of its own view from the {@link enyo.Component} bubbling hierarchy.
	*
	* Note that `enyo.ViewController` may have components defined in its
	* `components` [array]{@glossary Array}, but these components should
	* not be `enyo.Controls`.
	*
	* @class enyo.ViewController
	* @extends enyo.Controller
	* @public
	*/
	enyo.kind(
		/** @lends enyo.ViewController.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ViewController',

		/**
		* @private
		*/
		kind: 'enyo.Controller',

		/**
		* The `view` property may either be a [constructor]{@glossary constructor}
		* (or [string]{@glossary String} naming a [kind]{@glossary kind}), an
		* instance of {@link enyo.Control}, a [string]{@glossary String} representing
		* the path to an instance of `enyo.Control`, an [object]{@glossary Object}
		* description of the view ([object literal/hash]), or `null` if it will be
		* set later. Setting this property to a constructor or string naming a kind
		* will automatically create an instance of that kind according to this
		* controller's settings. If the `view` is set to an instance, it will be
		* rendered according to the properties of the controller. If this property
		* is a constructor, it will be preserved in the
		* [viewKind]{@link enyo.ViewController#viewKind} property. Once
		* initialization is complete, the instance of this controller's view will be
		* available via this property.
		*
		* @type {enyo.Control|String|Object}
		* @default null
		* @public
		*/
		view: null,

		/**
		* The preserved [kind]{@glossary kind} for this controller's view. You may
		* set this to a [constructor]{@glossary constructor} or a
		* [string]{@glossary String} that resolves to a constructor (or the
		* [view]{@link enyo.ViewController#view} property). In either case, if a
		* view is set explicitly or this property is used, the constructor will be
		* available via this property.
		*
		* @type {String}
		* @default null
		* @public
		*/
		viewKind: null,

		/**
		* Designates where the controller's view will render. This should be a
		* string consisting of either `'document.body'` (the default) or the DOM id
		* of a node (either inserted by an {@link enyo.Control} or static HTML
		* already in the `document.body`). If the controller has a parent (because
		* it was instantiated as a component in an `enyo.Control`, this property
		* will be ignored and the view will instead be rendered in the parent. This
		* will not happen if the controller is a component of {@link enyo.Component}
		* or is set as the `controller` property of an `enyo.Control`.
		*
		* @type {String}
		* @default 'document.body'
		* @public
		*/
		renderTarget: 'document.body',

		/**
		* When the view of the controller has its [destroy()]{@link enyo.Control#destroy}
		* method called, it automatically triggers its own removal from the controller's
		* [view]{@link enyo.ViewController#view} property. By default, the controller
		* will not create a new view (from [viewKind]{@link enyo.ViewController#viewKind})
		* automatically unless this flag is set to `true`.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		resetView: false,

		/**
		* Renders the controller's view, if possible. If the controller is a
		* component of a [UiComponent]{@link enyo.UiComponent}, the view will be
		* rendered into its container; otherwise, the view will be rendered into the
		* controller's [renderTarget]{@link enyo.ViewController#renderTarget}. If
		* the view is already rendered, this method will do nothing.
		*
		* @param {String} [target] - When specified, this value will be used instead of
		*	[renderTarget]{@link enyo.ViewController#renderTarget}.
		* @public
		*/
		render: function (target) {
			var v = this.view,
				t = target || this.renderTarget;
			if (v) {
				if (v.hasNode() && v.generated) { return; }
				// here we test to see if we need to render it into our target node or the container
				if (this.container) {
					v.render();
				} else {
					v.renderInto(enyo.dom.byId(t) || enyo.getPath(t));
				}
			}
		},

		/**
		* Renders the view into the specified `target` and sets the
		* [renderTarget]{@link enyo.ViewController#renderTarget} property to
		* `target`.
		*
		* @param {String} target - Where the view will be rendered into.
		* @public
		*/
		renderInto: function (target) {
			this.render((this.renderTarget=target));
		},

		/**
		* Responds to changes in the controller's [view]{@link enyo.ViewController#view}
		* property during initialization or whenever `set('view', ...)` is called.
		* If a [constructor]{@glossary constructor} is found, it will be instanced
		* or resolved from a [string]{@glossary String}. If a previous view exists
		* and the controller is its [owner]{@link enyo.Component#owner}, it will be
		* destroyed; otherwise, it will simply be removed.
		*
		* @private
		*/
		viewChanged: function (previous) {
			if (previous) {
				previous.set('bubbleTarget', null);
				if (previous.owner === this && !previous.destroyed) {
					previous.destroy();
				}
				if (previous.destroyed && !this.resetView) {
					return;
				}
			}
			var v = this.view;
			// if it is a string resolve it
			if (typeof v == 'string') {
				v = enyo.getPath(v);
			}
			// if it is a function we need to instance it
			if (typeof v == 'function') {
				// save the constructor for later
				this.viewKind = v;
				v = null;
			}
			if (typeof this.viewKind == 'string') {
				this.viewKind = enyo.getPath(this.viewKind);
			}
			if ((!v && this.viewKind) || (v && typeof v == 'object' && !(v instanceof enyo.UiComponent))) {
				var d = (typeof v == 'object' && v !== null && !v.destroyed && v) || {kind: this.viewKind},
					s = this;
				// in case it isn't set...
				d.kind = d.kind || this.viewKind || enyo.defaultCtor;
				v = this.createComponent(d, {
					owner: this,
					// if this controller is a component of a UiComponent kind then it
					// will have assigned a container that we can add to the child
					// so it will register as a child and control to be rendered in the
					// correct location
					container: this.container || null,
					bubbleTarget: this
				});
				v.extend({
					destroy: enyo.inherit(function (sup) {
						return function () {
							sup.apply(this, arguments);
							// if the bubble target is the view contorller then we need to
							// let it know we've been destroyed
							if (this.bubbleTarget === s) {
								this.bubbleTarget.set('view', null);
							}
						};
					})
				});
			} else if (v && v instanceof enyo.UiComponent) {
				// make sure we grab the constructor from an instance so we know what kind
				// it was to recreate later if necessary
				if (!this.viewKind) {
					this.viewKind = v.ctor;
				}
				v.set('bubbleTarget', this);
			}
			this.view = v;
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.viewChanged();
			};
		}),

		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				this.view = null;
				this.viewKind = null;
				sup.apply(this, arguments);
			};
		}),
		/**
			The `controller` can't be the instance owner of its child view for event
			propagation reasons. When this flag is `true`, it ensures that events will
			not be handled multiple times (by the `controller` and its `view`
			separately).
		*/
		notInstanceOwner: true
	});

})(enyo, this);
