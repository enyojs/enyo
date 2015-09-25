var rAF = window.requestAnimationFrame;

var
	animation = require('enyo/animation'),
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Control = require('enyo/Control'),
	EventEmitter = require('enyo/EventEmitter'),
	rAF = animation.requestAnimationFrame;

var
	CardViewLayout = require('../CardViewLayout');

var ViewMgr = kind({
	kind: Control,
	layoutKind: CardViewLayout,
	mixins: [EventEmitter],
	animated: true,
	classes: 'enyo-unselectable',

	/**
	* View type
	*
	* @type {String}
	* @default fixed
	* @public
	*/
	type: 'fixed',

	/**
	* Active view
	*
	* @type {Control}
	* @private
	*/
	active: null,

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
	* @default 10
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

	manager: null,
	managerChanged: function (was, is) {
		if (was) this.off('*', was.managerEvent);
		if (is) this.on('*', is.managerEvent);
	},

	handlers: {
		ondown: 'handleDown',
		ondragstart: 'handleDragStart',
		ondrag: 'handleDrag',
		ondragfinish: 'handleDragFinish'
	},

	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.managerEvent = this.managerEvent.bind(this);
		this.managerChanged(null, this.manager);

		if (this.type == 'fixed') this.initFirstView();
		else if (this.type == 'floating') this.stack = [];
	},
	rendered: function () {
		Control.prototype.rendered.apply(this, arguments);
		if (this.type == 'floating') this.initFirstView();
		this.set('dismissed', false);
	},
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

	addControl: function (control, before) {
		Control.prototype.addControl.apply(this, arguments);

		if (!this.viewNames[control.name]) {
			this.addView(control);
		}
	},
	removeControl: function (control) {
		var i, l,
			index = this.views.indexOf(control);
		if (index >= 0) {
			this.views.splice(index, 1);
			this.viewNames[control.name] = null;

			for (i = index, l = this.views.length; i < l; i++) {
				this.viewNames[this.views[i].name] = i;
			}
		}
	},

	/**
	* Renders the initially active view
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
			this._activate(view);
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
		var index, name,
			isControl = view instanceof Control,
			_view = isControl ? view : utils.clone(view);

		owner = _view.owner || owner || this;
		if (isControl) {
			_view.set('owner', owner);
			if (_view instanceof ViewMgr) {
				_view.isManager = true;
				_view.set('manager', this.manager || this);
			}
		} else {
			_view.owner = owner;
			if (isManager || _view.isManager) {
				if (!_view.name) {
					_view.name = 'viewManager' + (Object.keys(this.viewManagers).length + 1);
				}
				_view.isManager = true;
				_view.manager = this.manager || this;
			}
		}

		if (_view.isManager) {
			this.viewManagers[_view.name] = _view;
		} else {
			index = this.views.push(_view),
			name = _view.name || (_view.name = 'view' + index);
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
		var view = this.peek();
		if (view) this.stack.pop();
		return view;
	},

	/**
	* @public
	*/
	peek: function () {
		var name;
		if (this.type == 'floating' && this.stack.length > 1) {
			name = this.stack[this.stack.length - 2];
			return this.activate(name);
		}
	},

	/**
	* @private
	*/
	canDrag: function (direction) {
		var index;
		if (this.draggable) {
			if (this.type == 'floating' && direction == -1) {
				return true;
			}
			else if (this.type == 'fixed') {
				index = this.views.indexOf(this.active);
				return	(index > 0 && direction == -1) ||
						(index < this.views.length - 1 && direction == 1);
			}
		}

		return false;
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
		}
	},

	/**
	* @private
	*/
	managerEvent: function (viewManager, event, view) {
		if (event == 'dismiss') this.managerDismissing(viewManager);
		else if (event == 'dismissed') this.managerDismissed(viewManager);
		else if (event == 'activated') this.managerActivated(viewManager, view);
		else if (event == 'deactivated') this.managerDeactivated(viewManager, view);
	},

	/**
	* Handles dismissal of child view managers
	*
	* @private
	*/
	managerDismissed: function (viewManager) {
		this.log(this.id, 'ViewMgr', viewManager.name, 'dismissed');
		this.teardownView(viewManager);
	},

	managerDismissing: function (viewManager) {
		this.log(this.id, 'ViewMgr', viewManager.name, 'dismissing');
	},

	managerActivated: function (viewManager, view) {
		this.log(this.id, 'activated', view.name);
	},

	managerDeactivated: function (viewManager, view) {
		this.log(this.id, 'deactivated', view.name);
	},

	/**
	* @private
	*/
	activate: function (viewName) {
		var p = this.getView(viewName);
		if (p) {
			if (this.type == 'floating' && this.stack[this.stack.length - 1] !== viewName) {
				this.stack.push(viewName);
			}
			rAF(this._activate.bind(this, p));
		}
		return p;
	},

	/**
	* @private
	*/
	_activate: function (view) {
		// render the activated view
		if (this.generated) {
			view.set('canGenerate', true);
			view.render();
		}
		if (!this.dragging && !view.isManager) {
			this.set('active', view);
			this.emit('activated', view);
		}
	},

	/**
	* @private
	*/
	deactivate: function (viewName) {
		var p = this.getView(viewName);
		if (p) rAF(this._deactivate.bind(this, p));
	},

	/**
	* @private
	*/
	_deactivate: function (view) {
		this.teardownView(view);

		if (!this.dragging) {
			if (!view.isManager) this.emit('deactivated', view);
			if (this.dismissed) this.emit('dismissed');
		}
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
		if (!this.draggable) return;
		this.set('dragging', true);
		this.dragDirection = 0;
		this.dragBounds = this.getBounds();

		return true;
	},

	/**
	* Handles `ondrag` events
	*
	* @private
	*/
	handleDrag: function (sender, event) {
		if (!this.draggable) return;

		this.decorateDragEvent(event);
		if (this.canDrag(event.direction)) {
			// clean up on change of direction
			if (this.dragDirection !== event.direction) {
				this.dragDirection = event.direction;
				if (this.dragView) {
					this.deactivate(this.dragView.name);
					this.dragView = null;
				}
			}

			// set up the new drag view
			if (!this.dragView) {
				if (this.dragDirection == 1) {
					this.dragView = this.next();
				} else if (this.type == 'floating') {
					this.dragView = this.peek();
				} else {
					this.dragView = this.previous();
				}
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
		if (!this.draggable) return;
		this.decorateDragEvent(event);
		// if the view has been dragged far enough
		if (event.percentDelta * 100 > this.dragSnapPercent) {
			// normally, there will be a becoming-active view to activate
			if (this.dragView) {
				this.activate(this.dragView.name);
				this.dragView = null;
			}
			// unless it's a floating ViewManager that is being dismissed
			else if (this.type == 'floating' && event.direction == -1) {
				this.dismiss();
			}
		}
		// otherwise the drag was small enough to be cancelled
		else {
			this.emit('cancelDrag', event);
			this.dragView = null;
		}
		this.set('dragging', false);

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