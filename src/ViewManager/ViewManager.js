/**
* ViewManager module
*
* @module enyo/ViewManager
* @wip
*/

/**
* Fires after a view has been created and rendered, if necessary, but before it transitions into
* viewport.
*
* @event module:enyo/ViewManager~ViewManager#activate
* @property {module:enyo/Control~Control} view The target view for the event
* @property {Boolean} dragging `true` for `activate` or `deactivate` events that occur as a result
*	of dragging
* @property {Number} direction Either 1 representing forward or -1 representing backward
* @public
*/

/**
* Fires after a view has been created, rendered, and transitioned into the viewport.
*
* @event module:enyo/ViewManager~ViewManager#activated
* @type {Object}
* @property {module:enyo/Control~Control} view The target view for the event
* @property {Boolean} dragging `true` for `activate` or `deactivate` events that occur as a result
*	of dragging
* @property {Number} direction Either 1 representing forward or -1 representing backward
* @public
*/

/**
* Fires on the previously active view when a new view has become active but before it has
* transitioned out of the viewport
*
* @event module:enyo/ViewManager~ViewManager#deactivate
* @property {module:enyo/Control~Control} view The target view for the event
* @property {Boolean} dragging `true` for `activate` or `deactivate` events that occur as a result
*	of dragging
* @property {Number} direction Either 1 representing forward or -1 representing backward
* @public
*/

/**
* Fires on the previously active view when it has transitioned out of the viewport and been torn
* down.
*
* @event module:enyo/ViewManager~ViewManager#deactivated
* @property {module:enyo/Control~Control} view The target view for the event
* @property {Boolean} dragging `true` for `activate` or `deactivate` events that occur as a result
*	of dragging
* @property {Number} direction Either 1 representing forward or -1 representing backward
* @public
*/

/**
* Fires on the previously active view when it has transitioned out of the viewport and been torn
* down.
*
* @event module:enyo/ViewManager~ViewManager#deactivated
* @property {module:enyo/Control~Control} view The target view for the event
* @property {Boolean} dragging `true` for `activate` or `deactivate` events that occur as a result
*	of dragging
* @property {Number} direction Either 1 representing forward or -1 representing backward
* @public
*/

/**
* Fires when this ViewManager is [activated]{@link module:enyo/ViewManager~ViewManager#activate} by
* its [manager]{@link module:enyo/ViewManager~ViewManager#manager} and ready to activate its own
* views.
*
* @event module:enyo/ViewManager~ViewManager#manage
* @public
*/

/**
* Fires when this ViewManager dimissal is initiated -- either by a call to
* [dismiss()]{@link module:enyo/ViewManager~ViewManager#dismiss} or when a
* [dismissable]{@link module:enyo/ViewManager~ViewManager#dismissable} ViewManager is on its first
* view and is dragged beyond the
* [dragThreshold]{@link module:enyo/ViewManager~ViewManager#dragThreshold}.
*
* @event module:enyo/ViewManager~ViewManager#dismiss
* @property {Boolean} dragging `true` for when dismissing as a result of dragging
* @public
*/

/**
* Fires when a ViewManager completes its dismissal.
*
* @event module:enyo/ViewManager~ViewManager#dismissed
* @public
*/

var
	animation = require('../animation'),
	kind = require('../kind'),
	utils = require('../utils'),
	Control = require('../Control'),
	EventEmitter = require('../EventEmitter'),
	SlideViewLayout = require('../SlideViewLayout'),
	rAF = animation.requestAnimationFrame;

var
	ScrimSupport = require('./ScrimSupport');

var viewCount = 0;

/**
* ViewManager manages views.
*
* ```
* module.exports = kind({
*	kind: ViewManager,
*	classes: 'contacts',
*
*	// All the views are declared in the common components block
*	components: [
*		{name: 'history', components: [
*			{content: 'History'},
*			{kind: Button, content: 'Next', ontap: 'next'}
*		]},
*		{name: 'dialer', active: true, components: [
*			{content: 'Dialer'},
*			{kind: Button, content: 'Inline Example', ontap: 'activateInline'},
*			{kind: Button, content: 'Previous', ontap: 'previous'},
*			{kind: Button, content: 'Next', ontap: 'next'}
*		]},
*		{name: 'contacts', components: [
*			{content: 'Contacts'},
*			{kind: Button, content: 'Previous', ontap: 'previous'},
*			{kind: Button, content: 'Add A Contact', ontap: 'pushAddContactView'}
*		]}
*	],
*
*	// Child ViewManagers are declared within a new managers block
*	managers: [
*		{name: 'add', kind: AddContact},
*		{name: 'inline', kind: ViewManager, floating: true, components: [
*			{content: 'view1', style: 'background: #424242; color: #fff;', ontap: 'nextInline'},
*			{content: 'view2', style: 'background: #424242; color: #fff;', ontap: 'nextInline'},
*			{content: 'view3', style: 'background: #424242; color: #fff;', ontap: 'dismissInline'}
*		]}
*	],
*
*	create: function () {
*		ViewManager.prototype.create.apply(this, arguments);
*
*		function log (sender, name, event) {
*			console.log('Event', name,
*				'on view', event.view.name,
*				event.dragging ? 'while dragging' : '');
*		}
*
*		// ViewManager emits events to ease view initialization and teardown without concern for the
*		// async nature of animations.
*
*		// `view` has been activated but not animated
*		this.on('activate', log);
*
*		// `view` has been activate and animated
*		this.on('activated', log);
*
*		// `view` has been deactivated but not animated
*		this.on('deactivate', log);
*
*		// `view` has been deactivated and animated
*		this.on('deactivated', log);
*	},
*
*	// Activate and navigate the Inline ViewManager
*	activateInline: function () {
*		this.activate('inline');
*	},
*	nextInline: function () {
*		this.$.inline.next();
*	},
*	dismissInline: function () {
*		this.$.inline.dismiss();
*	},
*
*	// Activate the Contacts ViewManager
*	pushAddContactView: function () {
*		var view = this.activate('add');
*		view.set('model', new Model({
*			first: 'First Name',
*			last: 'Last Name'
*		}));
*	}
* });
* ```
*
* @class ViewManager
* @extends module:enyo/Control~Control
* @ui
* @public
* @wip
*/
var ViewMgr = kind(
	/** @lends module:enyo/ViewManager~ViewManager.prototype */ {

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
	animate: true,

	/**
	* @private
	*/
	classes: 'enyo-viewmanager',

	// PUBLIC PROPERTIES

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
	* When `true`, the views can be dragged or flicked into and out of view.
	* When `false`, the views cannot be dragged or flicked.
	* When `drag`, the views can *only* be dragged and not flicked.
	* When `flick`, the views can *only* be flicked and not dragged.
	*
	* @type {Boolean|String}
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
	dragThreshold: 25,

	/**
	* If `true`, this ViewManager 'floats' over its parent `manager`
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	floating: false,

	/**
	* If created within another ViewManager, `manager` will maintain a reference to that
	* ViewManager which will be notified of activated, deactivated, dismiss, and dismissed events
	* from this ViewManager.
	*
	* @type {module:enyo/ViewManager~ViewManager}
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
	* When `draggable`, this constrains the drag to this direction.
	*
	* @type {String}
	* @default horizontal
	* @public
	*/
	orientation: 'horizontal',

	/**
	* The number of views managed by this ViewManager. This member is observable but should be
	* considered read-only.
	*
	* @type {Number}
	* @default 0
	* @readOnly
	* @public
	*/
	viewCount: 0,

	// PRIVATE PROPERTIES

	/**
	* Active view
	*
	* @type {module:enyo/Control~Control}
	* @private
	*/
	active: null,

	/**
	* @private
	*/
	activeChanged: function (was, is) {
		if (was) {
			if (this.dragging) {
				this.set('dragging', false);
				this.releaseDraggedView = was.retainNode();
			}
			this.emitViewEvent('deactivate', was);
		}
	},

	/**
	* Indicates the logical direction of a view activation. May be used by ViewLayouts to inform the
	* direction of their animation
	*
	* @type {Number}
	* @default 0
	* @private
	*/
	direction: 0,

	/**
	* `true` when this ViewManager has been dismissed
	*
	* @type {Boolean}
	* @default false
	* @private
	*/
	dismissed: false,

	/**
	* `true` when a drag gesture is in process
	*
	* @type {Boolean}
	* @default false
	* @private
	*/
	dragging: false,

	/**
	* During a drag, contains a reference to the becoming-active view
	*
	* @private
	*/
	dragView: null,

	/**
	* @type {Boolean}
	*/
	flicked: false,

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
		onflick: 'handleFlick',
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

		this.on('*', this.notifyViews, this);
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
		var managersOwner = this.hasOwnProperty('managers') ? this.getInstanceOwner() : this;

		// view configs or instances
		this.views = [];
		this.viewManagers = {};

		// map of view name to index
		this.viewNames = {};

		// import kind and user components into this.views
		this.importViewConfig(this.kindComponents, this);
		this.importViewConfig(this.components, this.getInstanceOwner());
		this.importViewConfig(this.managers, managersOwner, true);
		this.viewCount = this.views.length;

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
			this.set('viewCount', this.views.length);
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
			this.set('viewCount', this.viewCount - 1);
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

		// find the first declared defaultView
		while ((view = this.views[i++]) && !name) {
			if (view.defaultView) {
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
	* @param  {Object[]|module:enyo/Control~Control[]} components List of components
	* @param  {module:enyo/Control~Control|null} [owner] Owner of components
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
	* @param {Object|module:enyo/Control~Control} view View config or instance
	* @param {module:enyo/Control~Control|null} [owner] Optional owner of view. Defaults to this.
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
			isManager = _view instanceof ViewMgr;
		} else {
			_view.owner = owner;
		}

		if (isManager) {
			// setting directly because the change handler is called manually during create
			_view.manager = this;
			this.viewManagers[name] = _view;
		} else {
			index = this.views.push(_view),
			this.viewNames[name] = index - 1;
		}
	},


	/**
	* Returns the index of the provided view. For fixed ViewManagers, this reflects the view's ordered
	* position. For floating ViewManagers, this reflects the last occurence of the view in the stack. If
	* the view isn't found, -1 is returned.
	*
	* @param  {module:enyo/Control~Control} view
	* @return {Number}      Index of `view`
	* @public
	*/
	indexOf: function (view) {
		var name = view && view.name;
		if (!name) return -1;

		return this.floating ? this.stack.lastIndexOf(name) : this.views.indexOf(view);
	},

	/**
	* Returns the currently active view
	*
	* @return {module:enyo/Control~Control}
	* @public
	*/
	getActive: function () {
		return this.active;
	},

	/**
	* Retrieves and creates, if necessary, a view or view manager by name
	*
	* @param {String} viewName Name of the view or view manager
	* @return {module:enyo/Control~Control} View
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
				view.addClass('enyo-view');
			}
		}

		return view;
	},

	/**
	* Navigates to the next view based on order of definition or creation
	*
	* @param {Object} [opts] Optional parameters to configure the activation
	* @return {module:enyo/Control~Control} Activated view
	* @public
	*/
	next: function (opts) {
		var index = this.views.indexOf(this.active) + 1,
			view = this.views[index];
		if (view) {
			this.direction = 1;
			return this.activate(view.name, opts);
		}
	},

	/**
	* Navigates to the previous view based on order of definition or creation
	*
	* @param {Object} [opts] Optional parameters to configure the activation
	* @return {module:enyo/Control~Control} Activated view
	* @public
	*/
	previous: function (opts) {
		var index = this.views.indexOf(this.active) - 1,
			view = this.views[index];
		if (view) {
			this.direction = -1;
			return this.activate(view.name, opts);
		}
	},

	/**
	* If this is a floating ViewManager, navigates back `count` views from the stack.
	*
	* @param {Number} [count] Number of views to pop off the stack. Defaults to 1.
	* @param {Object} [opts] Optional parameters to configure the deactivation
	* @return {module:enyo/Control~Control} Activated view
	* @public
	*/
	back: function (count, opts) {
		var name,
			depth = this.stack.length;
		if (this.floating && depth > 0) {
			if (this.dragging) {
				name = this.stack[0];
			} else {
				count = count > depth ? depth : count || 1;
				name = this.stack.splice(0, count).pop();
			}
			this.direction = -1;
			return this._activate(name, opts);
		}
	},

	/**
	* Determines if the ViewManager can be dragged in the provided direction
	*
	* @param {Number} direction -1 or 1 indicating the direction of the drag
	* @param {String} [mode] When provided, requires `draggable` be `true` or the provided value
	* @private
	*/
	canDrag: function (direction, mode) {
		var index,
			check = mode ? this.draggable === true || this.draggable == mode : this.draggable;
		if (check) {
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
	* @private
	*/
	determineDirection: function (view) {
		var isIndex, wasIndex;

		// for a floating VM, the default direction is always forward
		if (this.floating) {
			this.direction = 1;
		}
		// fixed VMs direction is based on each view's ordered position
		else {
			isIndex = this.indexOf(view);
			wasIndex = this.indexOf(this.active);
			this.direction = wasIndex < isIndex ? 1 : -1;
		}
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
	* @param {Object} [opts] Optional parameters to configure the deactivation
	* @public
	*/
	dismiss: function (opts) {
		if (this.manager) {
			this.direction = -1;
			this.set('activationOptions', opts);
			this.set('dismissed', true);
			this.emit('dismiss', {dragging: false});
			this.set('active', null);
			this.stack = [];
		}
	},

	/**
	* When any view event (activate, activated, deactivate, deactivated) fires, notify the view of
	* its change of state by calling a method matching the event (e.g. activate()), if it exists.
	*
	* @private
	*/
	notifyViews: function (sender, name, event) {
		var viewEvent = name == 'activate' || name == 'activated'
					|| name == 'deactivate' || name == 'deactivated';

		// Any event for a view will have an event payload with a view property indicating the view
		// that is changing.
		if (event && event.view && viewEvent && utils.isFunction(event.view[name])) {
			event.view[name](event);
		}
	},

	/**
	* @private
	*/
	emitViewEvent: function (name, view) {
		this.emit(name, {
			view: view,
			dragging: this.dragging,
			direction: this.direction
		});
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
	* @param {Object} [opts] Optional parameters to configure the activation
	* @public
	*/
	activate: function (viewName, opts) {
		var replace = !!(opts && opts.replace),
			view = this._activate(viewName, opts);
		if (!replace && view && !this.isManager(view) && this.active && this.floating) {
			this.stack.unshift(this.active.name);
		}

		return view;
	},

	/**
	* Activates a view
	*
	* @private
	*/
	_activate: function (viewName, opts) {
		var replace = !!(this.activationOptions && this.activationOptions.replace),
			view = this.getView(viewName);
		if (view) {
			if (!this._toBeActivated) {
				rAF(function () {
					this.activateImmediate(this._toBeActivated, opts);
					this._toBeActivated = null;
				}.bind(this));
			}
			else if (!replace && this.floating && !this.isManager(view)) {
				this.stack.unshift(this._toBeActivated.name);
			}
			this.set('activationOptions', opts);
			this._toBeActivated = view;
		}
		return view;
	},

	/**
	* @private
	*/
	activateImmediate: function (view, opts) {
		// render the activated view if not already
		if (this.generated && !view.generated) {
			view.set('canGenerate', true);
			view.render();
		}
		if (this.isManager(view)) {
			view.emit('manage');
		}
		else {
			if (!this.direction) this.determineDirection(view);
			this.emitViewEvent('activate', view);
			if (!this.dragging) this.set('active', view);
		}
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

		if (!this.isManager(view)) this.emitViewEvent('deactivated', view);
		if (!this.dragging && this.dismissed) this.emit('dismissed');
	},

	/**
	* Tears down a view or ViewManager if not flagged `persistent`
	*
	* @private
	*/
	teardownView: function (view) {
		if (view.node && !view.persistent) {
			if (!this.releaseDraggedView) {
				view.node.remove();
				view.node = null;
			}
			view.set('canGenerate', false);
			view.teardownRender(true);
		}
	},

	/**
	* @private
	*/
	isManager: function (view) {
		return view && !!this.viewManagers[view.name];
	},

	// Layout

	/**
	* Handles the 'complete' event from its layout indicating a view has completed its layout
	* @private
	*/
	handleLayoutComplete: function (sender, name, event) {
		if (event.was) this.deactivateImmediate(event.was);
		if (event.is) this.emitViewEvent('activated', event.is);
		this.direction = 0;
	},

	// Flick

	/**
	* Flicks are handled by the drag system so here we only test if there was a valid flick and rely
	* on the ondragfinish handler to actually act on the flick as if it were a completed drag.
	*
	* @private
	*/
	handleFlick: function (sender, event) {
		var isHorizontal = this.orientation == 'horizontal',
			dx = event.xVelocity,
			dy = event.yVelocity,
			adx = Math.abs(dx),
			ady = Math.abs(dy),
			direction = 0;

		// Set direction iff the primary flick direction matches the orientation
		if (isHorizontal && adx > ady) {
			direction = dx < 0 ? 1 : -1;
		}
		else if (!this.isHorizontal && ady > adx) {
			direction = dy < 0 ? 1 : -1;
		}

		// If we have a direction, are flickable, and flickable in that direction, indicate it
		if (direction && this.canDrag(direction, 'flick')) {
			this.flicked = true;
			return true;
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
		this.set('dragging', 'start');
		this.direction = 0;
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
		if (this.validateDrag(event)) {
			// clean up on change of direction
			if (this.direction !== event.direction) {
				this.direction = event.direction;
				if (this.dragView === false) {
					this.dragView = null;
				} else {
					this.resetDragView();
				}
			}

			// dragView can be a View, `false`, or `null`. `null` indicates we need to (try to)
			// activate the becoming-active view. It should be null when a drag starts or when
			// there's a change of direction. `false` indicates that we've tried to activate a view
			// but there isn't one in that direction.
			if (this.dragView === null) {
				if (this.direction == 1) {
					this.dragView = this.next();
				} else if (this.floating) {
					this.dragView = this.back();
					if (!this.dragView) this.emit('dismiss', {dragging: true});
				} else {
					this.dragView = this.previous();
				}
				this.dragView = this.dragView || false;
			}
			this.emit('drag', event);

			return true;
		} else {
			// Reset the drag state when dragging in an invalid direction
			this.resetDragView();
			this.direction = 0;
		}
	},

	/**
	* Handles `ondragfinish` events
	*
	* @private
	*/
	handleDragFinish: function (sender, event) {
		if (this.releaseDraggedView) {
			this.releaseDraggedView();
			this.releaseDraggedView = null;
		}
		if (this.validateDrag(event)) {
			// if the view has been dragged far enough
			if (this.flicked || event.percentDelta * 100 > this.dragThreshold) {
				this.set('dragging', false);
				// normally, there will be a becoming-active view to activate
				if (this.dragView) {
					// dragging for floating views can only be a back action so shift it off the stack
					if (this.floating) this.stack.shift();
					// stack updates aren't necessary as we updated it above
					this.activateImmediate(this.dragView);
				}
				// unless it's a floating ViewManager that is being dismissed
				else if (this.isDimissable() && event.direction == -1) {
					this.dismiss();
				}
			}
			// otherwise the drag was small enough to be cancelled
			else {
				this.cancelDrag();
			}
			this.flicked = false;
			event.preventTap();

			this.dragView = null;
			return true;
		} else {
			this.set('dragging', false);
			this.dragView = null;
		}
	},

	/**
	* Deactivates drag view and resets `dragView`
	*
	* @private
	*/
	resetDragView: function () {
		if (this.dragView) {
			this.emitViewEvent('deactivate', this.dragView);
			this.deactivate(this.dragView.name);
			this.dragView = null;
		}
	},

	/**
	* @protected
	*/
	cancelDrag: function () {
		var was = this.dragging;
		this.set('dragging', false);
		// only emit cancelDrag if a valid drag was encountered (=== true and != 'start')
		if (was === true) {
			// Since we're restoring the active view, the navigation direction is the opposite of the
			// drag direction.
			this.direction = -this.direction;
			this.emit('cancelDrag');
		}
	},

	/**
	* Validates that the drag event should be processed
	*
	* @private
	*/
	validateDrag: function (event) {
		var dragging = false,
			draggable = this.dragging && this.draggable && !this.dismissed;

		if (draggable) {
			this.decorateDragEvent(event);
			dragging = 
				// check direction against orientation to ignore drags that don't apply to this. the
				// check should only be necessary for the first drag event so it's further guarded
				// by the special 'start' value of dragging.
				!(this.dragging == 'start' && !event[this.orientation]) &&

				// Intentionally ignoring draggable mode here so dragView will reference the
				// becoming-active view even if we are only supporting flick and not drag
				this.canDrag(event.direction);
		
			this.set('dragging', dragging);
		}

		return draggable && dragging;
	},

	/**
	* Calculates and adds a few additional properties to the event to aid in logic in ViewManager
	* and ViewLayout
	*
	* @private
	*/
	decorateDragEvent: function (event) {
		var isHorizontal = this.orientation == 'horizontal',
			size = isHorizontal ? this.dragBounds.width : this.dragBounds.height,
			delta = isHorizontal ? event.dx : event.dy;

		// 'natural' touch causes us to invert the physical change
		event.direction = delta < 0 ? 1 : -1;

		// if we're only flickable, we won't set the deltas to suppress the views moving until a
		// flick is encountered.
		if (this.canDrag(event.direction, 'drag')) {
			event.delta = delta;
			event.percentDelta = 1 - (size - Math.abs(event.delta)) / size;
		} else {
			event.delta = 0;
			event.percentDelta = 0;
		}
	}
});

module.exports = ViewMgr;

/**
* The {@link module:enyo/ViewManager~ScrimSupport} mixin
*
* @private
*/
module.exports.ScrimSupport = ScrimSupport;
