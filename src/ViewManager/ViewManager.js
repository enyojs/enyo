var rAF = window.requestAnimationFrame;

var
	animation = require('enyo/animation'),
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Control = require('enyo/Control'),
	EventEmitter = require('enyo/EventEmitter'),
	rAF = animation.requestAnimationFrame;

var
	SlideViewLayout = require('../SlideViewLayout');

var viewCount = 0;

var ViewMgr = kind({

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	layoutKind: SlideViewLayout,

	/**
	* @private
	*/
	mixins: [EventEmitter],

	/**
	* @private
	*/
	animated: true,

	/**
	* @private
	*/
	classes: 'enyo-viewmanager',

	/**
	* If `true`, this ViewManager 'floats' over its parent `manager`
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	floating: false,

	/**
	* Active view
	*
	* @type {Control}
	* @private
	*/
	active: null,

	/**
	* @private
	*/
	activeChanged: function (was, is) {
		if (was) {
			this.emit('deactivate', {
				view: was,
				dragging: false
			});
		}
	},

	/**
	* Determines if and how the default view is activated. The default view is either the first
	* view with a truthy `active` member or the first view if none are marked active.
	*
	* * 'off' - No view is activated by default
	* * 'create' - The default view is activated on create and not animated into position
	* * 'render' - The default view is activated on render and animated into position
	* * 'auto' - For floating ViewManagers, this is equivalent to 'render'. For non-floating
	*   ViewManagers, this is equivalent to 'create'.
	*
	* @type {String}
	* @default auto
	* @public
	*/
	activateDefault: 'auto',

	/**
	* `true` when this ViewManager has been dismissed
	*
	* @type {Boolean}
	* @default false
	* @private
	*/
	dismissed: false,

	/**
	* Determines if the view can be dismissed by dragging. The ViewManager can be programmatically
	* dismissed via dismiss() regardless of the value of this property. If the ViewManager is the
	* root and does not have a `manager`, it cannot be dismissed by dragging or by `dismiss()`.
	*
	* * `true` - Can be dismissed
	* * `false` - Cannot be dismissed
	* * 'auto' - Can be dismissed if `floating` is `true`
	*
	* @type {Boolean|String}
	* @default auto
	* @public
	*/
	dismissable: 'auto',

	/**
	* When `true`, the views can be dragged into and out of view.
	*
	* @type {Boolean}
	* @default true
	* @public
	*/
	draggable: true,

	/**
	* Percent a new view must be dragged into the viewport to be activated on drag release
	*
	* @type {Number}
	* @default 25
	* @public
	*/
	dragSnapPercent: 25,

	/**
	* When `draggable`, this constrains the drag to this direction.
	*
	* @type {String}
	* @default horizontal
	* @public
	*/
	orientation: 'horizontal',

	/**
	* During a drag, contains a reference to the becoming-active view
	*
	* @private
	*/
	dragView: null,

	/**
	* If created within another ViewManager, `manager` will maintain a reference to that
	* ViewManager which will be notified of activated, deactivated, dismiss, and dismissed events
	* from this ViewManager.
	*
	* @type {enyo.ViewManager}
	* @default null
	* @public
	*/
	manager: null,

	/**
	* @private
	*/
	managerChanged: function (was, is) {
		if (was) this.off('*', was.managerEvent);
		if (is) this.on('*', is.managerEvent);
	},

	/**
	* @private
	*/
	layoutKindChanged: function (was, is) {
		Control.prototype.layoutKindChanged.apply(this, arguments);
		if (this.layout && this.layout.on) {
			this.layout.on('complete', this.handleLayoutComplete, this);
		}
	},

	/**
	* @private
	*/
	handlers: {
		ondown: 'handleDown',
		ondragstart: 'handleDragStart',
		ondrag: 'handleDrag',
		ondragfinish: 'handleDragFinish'
	},

	/**
	* @private
	*/
	create: function () {
		// Set layoutCover for floating ViewManagers that haven't explicitly defined it
		if (this.floating && this.layoutCover === undefined) this.layoutCover = true;

		Control.prototype.create.apply(this, arguments);

		// cache a bound reference to the managerEvent handler
		this.managerEvent = this.managerEvent.bind(this);
		this.managerChanged(null, this.manager);

		if (this.floating) this.stack = [];

		if (this.activateDefault == 'create' || (this.activateDefault == 'auto' && !this.floating)) {
			this.initFirstView();
		}
	},

	/**
	* @private
	*/
	rendered: function () {
		Control.prototype.rendered.apply(this, arguments);
		if (this.activateDefault == 'render' || (this.activateDefault == 'auto' && this.floating)) {
			this.initFirstView();
		}
		this.set('dismissed', false);
	},

	/**
	* @private
	*/
	initComponents: function () {
		var managersOwner = Object.hasOwnProperty('managers') ? this.getInstanceOwner() : this;

		// view configs or instances
		this.views = [];
		this.viewManagers = {};

		// map of view name to index
		this.viewNames = {};

		// import kind and user components into this.views
		this.importViewConfig(this.kindComponents, this);
		this.importViewConfig(this.components, this.getInstanceOwner());
		this.importViewConfig(this.managers, managersOwner, true);

		// clean up references
		this.components = this.kindComponents = null;
	},

	/**
	* If a newly added control doesn't exist in the view or manager array, add it
	*
	* @private
	*/
	addControl: function (control, before) {
		var viewIndex = this.viewNames[control.name];
		Control.prototype.addControl.apply(this, arguments);

		if (!control.isChrome && !(viewIndex || viewIndex === 0) && !this.viewManagers[control.name]) {
			this.addView(control);
		}
	},

	/**
	* @private
	*/
	removeControl: function (control) {
		var i, l,
			index = this.views.indexOf(control);

		Control.prototype.removeControl.apply(this, arguments);
		if (index >= 0) {
			this.views.splice(index, 1);
			this.viewNames[control.name] = null;

			for (i = index, l = this.views.length; i < l; i++) {
				this.viewNames[this.views[i].name] = i;
			}
		}
	},

	/**
	* Activates the initial view
	*
	* @private
	*/
	initFirstView: function () {
		var name, view,
			i = 0;

		if (this.views.length === 0) return;

		// find the first declared active view
		while ((view = this.views[i++]) && !name) {
			if (view.active) {
				name = view.name;
			}
		}

		name = name || this.views[0].name;
		if (this.generated) {
			this.activate(name);
		} else {
			view = this.getView(name);
			this.activateImmediate(view);
		}
	},

	/**
	* Adds the list of components as views
	*
	* @param  {Object[]|enyo.Control[]} components List of components
	* @param  {enyo.Control|null} [owner] Owner of components
	*
	* @private
	*/
	importViewConfig: function (components, owner, isManager) {
		var c,
			i = 0;

		while (components && (c = components[i++])) {
			this.addView(c, owner, isManager);
		}
	},

	/**
	* Adds a new view to the view set
	*
	* @param {Object|enyo.Control} view View config or instance
	* @param {enyo.Control|null} [owner] Optional owner of view. Defaults to this.
	*
	* @private
	*/
	addView: function (view, owner, isManager) {
		var index,
		isControl = view instanceof Control,
			_view = isControl ? view : utils.clone(view),
			name = _view.name = _view.name || 'view' + (++viewCount);

		owner = _view.owner || owner || this;
		if (isControl) {
			_view.set('owner', owner);
			if (_view instanceof ViewMgr) {
				_view.isManager = true;
			}
		} else {
			_view.owner = owner;
			if (isManager || _view.isManager) {
				_view.isManager = true;
			}
		}

		if (_view.isManager) {
			// setting directly because the change handler is called manually during create
			_view.manager = this;
			this.viewManagers[name] = _view;
		} else {
			index = this.views.push(_view),
			this.viewNames[name] = index - 1;
		}
	},

	/**
	* @public
	*/
	getView: function (viewName) {
		var view = this.viewManagers[viewName],
			index = this.viewNames[viewName];

		// if it's a manager
		if (view) {
			// but not created, create it
			if (!(view instanceof ViewMgr)) {
				view = this.viewManagers[viewName] = this.createComponent(view);
			}
		}
		// otherwise, it's probably a view
		else {
			view = this.views[index];
			// but it might need to be created too
			if (view && !(view instanceof Control)) {
				view = this.views[index] = this.createComponent(view);
			}
		}

		return view;
	},

	/**
	* @public
	*/
	next: function () {
		var index = this.views.indexOf(this.active) + 1,
			view = this.views[index];
		if (view) {
			return this.activate(view.name);
		}
	},

	/**
	* @public
	*/
	previous: function () {
		var index = this.views.indexOf(this.active) - 1,
			view = this.views[index];
		if (view) {
			return this.activate(view.name);
		}
	},

	/**
	* @public
	*/
	back: function () {
		var name,
			depth = this.stack.length;
		if (this.floating && depth > 0) {
			name = this.dragging ? this.stack[0] : this.stack.shift();
			return this._activate(name);
		}
	},

	/**
	* @private
	*/
	canDrag: function (direction) {
		var index;
		if (this.draggable) {
			if (this.isDimissable() && direction == -1) {
				return true;
			}
			else if (!this.floating) {
				index = this.views.indexOf(this.active);
				return	(index > 0 && direction == -1) ||
						(index < this.views.length - 1 && direction == 1);
			}
		}

		return false;
	},

	/**
	* Indicates if the view is dismissable via dragging
	*
	* @return {Boolean}
	* @public
	*/
	isDimissable: function () {
		return this.dismissable === true || (this.dismissable == 'auto' && this.floating);
	},

	/**
	* Dismisses a view manager. If this is a root (manager-less) view manager, it cannot be
	* dismissed.
	*
	* @public
	*/
	dismiss: function () {
		if (this.manager) {
			this.set('active', null);
			this.set('dismissed', true);
			this.emit('dismiss');
			this.stack = [];
		}
	},

	/**
	* @private
	*/
	managerEvent: function (viewManager, event, view) {
		if (event == 'dismissed') this.managerDismissed(viewManager);
		this.emit('manager-' + event, {
			manager: viewManager
		});
	},

	/**
	* Handles dismissal of child view managers
	*
	* @private
	*/
	managerDismissed: function (viewManager) {
		this.teardownView(viewManager);
	},

	/**
	* Activates a new view.
	*
	* For floating ViewManagers, the view will be added to the stack and can be removed by `back()`.
	*
	* @param {String} viewName Name of the view to activate
	* @public
	*/
	activate: function (viewName) {
		var view = this._activate(viewName);
		if (view && !view.isManager && this.active && this.floating) {
			this.stack.unshift(this.active.name);
		}
		return view;
	},

	/**
	* Activates a view
	*
	* @private
	*/
	_activate: function (viewName) {
		var view = this.getView(viewName);
		if (view) rAF(this.activateImmediate.bind(this, view));
		return view;
	},

	/**
	* @private
	*/
	activateImmediate: function (view) {
		// render the activated view if not already
		if (this.generated && !view.generated) {
			view.set('canGenerate', true);
			view.render();
		}
		this.emit('activate', {
			view: view,
			dragging: this.dragging
		});
		if (!this.dragging && !view.isManager) this.set('active', view);
	},

	/**
	* @private
	*/
	deactivate: function (viewName) {
		var view = this.getView(viewName);
		if (view) rAF(this.deactivateImmediate.bind(this, view));
		return view;
	},

	/**
	* @private
	*/
	deactivateImmediate: function (view) {
		this.teardownView(view);

		if (!view.isManager) {
			this.emit('deactivated', {
				view: view,
				dragging: this.dragging
			});
		}

		if (!this.dragging && this.dismissed) this.emit('dismissed');
	},

	/**
	* Tears down a view or ViewManager if not flagged `persistent`
	*
	* @private
	*/
	teardownView: function (view) {
		if (view.node && !view.persistent) {
			view.node.remove();
			view.set('canGenerate', false);
			view.teardownRender(true);
		}
	},

	// Layout

	/**
	* Handles the 'complete' event from its layout indicating a view has completed its layout
	* @private
	*/
	handleLayoutComplete: function (sender, name, view) {
		if (view == this.active) {
			this.emit('activated', {
				view: view
			});
		} else {
			this.deactivate(view.name);
		}
	},

	// Draggable

	/**
	* Handles `ondown` events
	*
	* @private
	*/
	handleDown: function (sender, event) {
		event.configureHoldPulse({endHold: 'onMove'});
	},

	/**
	* Handles `ondragstart` events
	*
	* @private
	*/
	handleDragStart: function (sender, event) {
		if (!this.draggable || this.dismissed) return;
		this.set('dragging', true);
		this.dragDirection = 0;
		this.dragView = null;
		this.dragBounds = this.getBounds();

		return true;
	},

	/**
	* Handles `ondrag` events
	*
	* @private
	*/
	handleDrag: function (sender, event) {
		if (!this.dragging || !this.draggable || this.dismissed) return;

		// check direction against orientation to ignore drags that don't apply to this
		if (!event[this.orientation]) {
			this.set('dragging', false);
			return;
		}

		this.decorateDragEvent(event);
		if (this.canDrag(event.direction)) {
			// clean up on change of direction
			if (this.dragDirection !== event.direction) {
				this.dragDirection = event.direction;
				if (this.dragView) {
					this.emit('deactivate', {
						view: this.dragView,
						dragging: true
					});
					this.deactivate(this.dragView.name);
					this.dragView = null;
				}
				else if (this.dragView === false) {
					this.dragView = null;
				}
			}

			// dragView can be a View, `false`, or `null`. `null` indicates we need to (try to)
			// activate the becoming-active view. It should be null when a drag starts or when
			// there's a change of direction. `false` indicates that we've tried to activate a view
			// but there isn't one in that direction.
			if (this.dragView === null) {
				if (this.dragDirection == 1) {
					this.dragView = this.next();
				} else if (this.floating) {
					this.dragView = this.back();
				} else {
					this.dragView = this.previous();
				}
				this.dragView = this.dragView || false;
			}
			this.emit('drag', event);
		}

		return true;
	},

	/**
	* Handles `ondragfinish` events
	*
	* @private
	*/
	handleDragFinish: function (sender, event) {
		if (!this.draggable || this.dismissed) return;

		this.decorateDragEvent(event);
		// if the view has been dragged far enough
		if (event.percentDelta * 100 > this.dragSnapPercent) {
			// normally, there will be a becoming-active view to activate
			if (this.dragView) {
				// dragging for floating views can only be a back action so shift it off the stack
				if (this.floating) this.stack.shift();
				// stack updates aren't necessary as we updated it above
				this._activate(this.dragView.name);
			}
			// unless it's a floating ViewManager that is being dismissed
			else if (this.isDimissable() && event.direction == -1) {
				this.dismiss();
			}
		}
		// otherwise the drag was small enough to be cancelled
		else {
			this.emit('cancelDrag', event);
		}
		this.set('dragging', false);
		event.preventTap();

		return true;
	},

	/**
	* Calculates and adds a few additional properties to the event to aid in logic in ViewManager
	* and ViewLayout
	*
	* @private
	*/
	decorateDragEvent: function (event) {
		var isHorizontal = this.orientation == 'horizontal',
			size = isHorizontal ? this.dragBounds.width : this.dragBounds.height;
		event.delta = isHorizontal ? event.dx : event.dy;
		// 'natural' touch causes us to invert the physical change
		event.direction = event.delta < 0 ? 1 : -1;
		event.percentDelta = 1 - (size - Math.abs(event.delta)) / size;
	}
});

module.exports = ViewMgr;