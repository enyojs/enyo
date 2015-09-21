var rAF = window.requestAnimationFrame;

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Control = require('enyo/Control'),
	EventEmitter = require('enyo/EventEmitter');

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

		if (this.type == 'fixed') this.initFirstPanel();
		else if (this.type == 'floating') this.stack = [];
	},
	rendered: function () {
		Control.prototype.rendered.apply(this, arguments);
		if (this.type == 'floating') this.initFirstPanel();
	},
	initComponents: function () {
		// panel configs or instance
		this.panels = [];

		// map of panel name to index
		this.panelNames = {};

		// import kind and user components into this.panels
		this.importPanelConfig(this.kindComponents, this);
		this.importPanelConfig(this.components, this.getInstanceOwner());

		// clean up references
		this.components = this.kindComponents = null;
	},

	addControl: function (control, before) {
		var index;
		Control.prototype.addControl.apply(this, arguments);

		index = this.panelNames[control.name];
		if (!index && index !== 0) {
			this.addPanel(control);
		}
	},
	removeControl: function (control) {
		var i, l,
			index = this.panels.indexOf(control);
		if (index >= 0) {
			this.panels.splice(index, 1);
			this.panelNames[control.name] = null;

			for (i = index, l = this.panels.length; i < l; i++) {
				this.panelNames[this.panels[i].name] = i;
			}
		}
	},

	/**
	* Renders the initially active panel
	*
	* @private
	*/
	initFirstPanel: function () {
		var name, panel,
			i = 0;

		if (this.panels.length === 0) return;

		// find the first declared active panel
		while ((panel = this.panels[i++]) && !name) {
			if (panel.active) {
				name = panel.name;
			}
		}

		name = name || this.panels[0].name;
		if (this.generated) {
			this.activate(name);
		} else {
			panel = this.getPanel(name);
			this._activate(panel);
		}
	},

	/**
	* Adds the list of components as panels
	*
	* @param  {Object[]|enyo.Control[]} components List of components
	* @param  {enyo.Control|null} [owner] Owner of components
	*
	* @private
	*/
	importPanelConfig: function (components, owner) {
		var c,
			i = 0;

		while (components && (c = components[i++])) {
			this.addPanel(c, owner);
		}
	},

	/**
	* Adds a new panel to the panel set
	*
	* @param {Object|enyo.Control} panel Panel config or instance
	* @param {enyo.Control|null} [owner] Optional owner of panel. Defaults to this.
	*
	* @private
	*/
	addPanel: function (panel, owner) {
		var isControl = panel instanceof Control,
			_panel = isControl ? panel : utils.clone(panel),
			index = this.panels.push(_panel),
			name = _panel.name || 'panel' + index;
		owner = _panel.owner || owner || this;

		if (isControl) {
			_panel.set('owner', owner);
			_panel.set('name', name);

			if (_panel instanceof ViewMgr) {
				_panel.set('manager', this.manager || this);
			}
		} else {
			_panel.owner = owner;
			_panel.name = name;
		}

		this.panelNames[name] = index - 1;
	},

	/**
	* @public
	*/
	getPanel: function (panelName) {
		var index = this.panelNames[panelName],
			p = this.panels[index];

		// not created yet
		if (p && !(p instanceof Control)) {
			p = this.panels[index] = this.createComponent(p);
		}

		return p;
	},

	/**
	 * @public
	 */
	next: function () {
		var index = this.panels.indexOf(this.active) + 1,
			panel = this.panels[index];
		if (panel) {
			return this.activate(panel.name);
		}
	},

	/**
	 * @public
	 */
	previous: function () {
		var index = this.panels.indexOf(this.active) - 1,
			panel = this.panels[index];
		if (panel) {
			return this.activate(panel.name);
		}
	},

	/**
	* @public
	*/
	back: function () {
		var name;
		if (this.type == 'floating') {
			this.stack.pop();
			name = this.stack[this.stack.length - 1];
			this.activate(name);
		}
	},

	canDrag: function (direction) {
		var index;
		if (this.draggable) {
			if (this.type == 'floating' && direction == -1) {
				return true;
			}
			else if (this.type == 'fixed') {
				index = this.panels.indexOf(this.active);
				return	(index > 0 && direction == -1) ||
						(index < this.panels.length - 1 && direction == 1);
			}
		}

		return false;
	},

	/**
	 * Dismisses a floating view manager
	 *
	 * @public
	 */
	dismiss: function () {
		if (this.type == 'floating') {
			this.set('active', null);
			this.set('dismissed', true);
			this.emit('dismiss');
		}
	},

	/**
	 * Since handler for events emitted from descendant view managers
	 *
	 * @param  {[type]} viewManager [description]
	 * @param  {[type]} event       [description]
	 * @param  {[type]} panel       [description]
	 *
	 * @return {[type]}             [description]
	 */
	managerEvent: function (viewManager, event, panel) {
		if (event == 'dismiss') this.managerDismissing(viewManager);
		else if (event == 'dismissed') this.managerDismissed(viewManager);
		else if (event == 'activated') this.managerActivated(viewManager, panel);
		else if (event == 'deactivated') this.managerDeactivated(viewManager, panel);
	},

	/**
	 * Handles dismissal of child view managers
	 *
	 * @private
	 */
	managerDismissed: function (viewManager) {
		this.log(this.id, 'ViewMgr', viewManager.name, 'dismissed');
		viewManager.destroy();
	},

	managerDismissing: function (viewManager) {
		this.log(this.id, 'ViewMgr', viewManager.name, 'dismissing');
	},

	managerActivated: function (viewManager, panel) {
		this.log(this.id, 'activated', panel.name);
	},

	managerDeactivated: function (viewManager, panel) {
		this.log(this.id, 'deactivated', panel.name);
	},

	/**
	* @private
	*/
	activate: function (panelName) {
		var p = this.getPanel(panelName);
		if (p) {
			if (this.type == 'floating' && this.stack[this.stack.length - 1] !== panelName) {
				this.stack.push(panelName);
			}
			rAF(this._activate.bind(this, p));
		}
		return p;
	},

	/**
	* @private
	*/
	_activate: function (panel) {
		// render the activated panel
		if (this.generated) panel.render();
		if (!this.dragging) {
			this.set('active', panel);
			this.emit('activated', panel);
		}
	},

	/**
	* @private
	*/
	deactivate: function (panelName) {
		var p = this.getPanel(panelName);
		if (p) rAF(this._deactivate.bind(this, p));
	},

	/**
	* @private
	*/
	_deactivate: function (panel) {
		if (panel.node) {
			panel.node.remove();
			panel.teardownRender(true);
		}

		if (!this.dragging) {
			this.emit('deactivated', panel);
			if (this.dismissed && this.manager) this.emit('dismissed');
		}
	},

	// Draggable

	handleDown: function (sender, event) {
		event.configureHoldPulse({endHold: 'onMove'});
	},

	handleDragStart: function (sender, event) {
		if (!this.draggable) return;
		this.set('dragging', true);
		this.dragDirection = 0;
		this.dragBounds = this.getBounds();

		return true;
	},

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
				this.dragView = this.dragDirection == 1 ? this.next() : this.previous();
			}
			this.emit('drag', event);
		}

		return true;
	},

	handleDragFinish: function (sender, event) {
		if (!this.draggable) return;
		this.decorateDragEvent(event);
		if (event.percentDelta * 100 > this.dragSnapPercent) {
			if (this.dragView) {
				this.activate(this.dragView.name);
				this.dragView = null;
			}
			else if (this.type == 'floating' && event.direction == -1) {
				this.dismiss();
			}
		} else {
			this.emit('cancelDrag', event);
			this.dragView = null;
		}
		this.set('dragging', false);

		return true;
	},

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