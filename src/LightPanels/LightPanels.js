require('enyo');

/**
* Contains the declaration for the {@link module:enyo/LightPanels~LightPanels} kind.
* @module enyo/LightPanels
*/

var
	kind = require('../kind'),
	dom = require('../dom'),
	asyncMethod = require('../utils').asyncMethod;

var
	Control = require('../Control'),
	ViewPreloadSupport = require('../ViewPreloadSupport'),
	TaskManagerSupport = require('../TaskManagerSupport');

var
	LightPanel = require('./LightPanel'),
	States = LightPanel.States;

var
	trans, wTrans;

/**
* @enum {Number}
* @memberof module:enyo/LightPanels~LightPanels
* @public
*/
var Direction = {
	FORWARDS: 1,
	BACKWARDS: -1
};

/**
* @enum {Number}
* @memberof module:enyo/LightPanels~LightPanels
* @public
*/
var Orientation = {
	HORIZONTAL: 'X',
	VERTICAL: 'Y'
};

/**
* The configurable options used by {@link module:enyo/LightPanels~LightPanels} when pushing panels.
*
* @typedef {Object} enyo.LightPanels~PushPanelOptions
* @property {Boolean} [direct] - If `true`, the transition to the panel whose index we are
*	changing to will not be animated.
* @property {Boolean} [forcePostTransition] - If `true`, forces post-transition work to be run
*	immediately after each panel is created.
* @property {Number} [targetIndex] - The index of the panel to display, otherwise the last panel
*	created will be displayed.
*/

/**
* A light-weight panels implementation that has basic support for CSS transitions between child
* components.
*
* @class LightPanels
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/LightPanels~LightPanels.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.LightPanels',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	mixins: [ViewPreloadSupport, TaskManagerSupport],

	/**
	* @private
	*/
	classes: 'enyo-light-panels',

	/**
	* @private
	*/
	defaultKind: LightPanel,

	/**
	* The index of the active panel.
	*
	* @type {Number}
	* @default -1
	* @public
	*/
	index: -1,

	/**
	* Indicates whether the panels animate when transitioning.
	*
	* @type {Boolean}
	* @default true
	* @public
	*/
	animate: true,

	/**
	* Indicates whether panels "wrap around" when moving past the end.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	wrap: false,

	/**
	* When `true`, previous panels are automatically popped when moving backwards.
	*
	* @type {Boolean}
	* @default true
	* @public
	*/
	popOnBack: true,

	/**
	* When `true`, previous panels are automatically popped when moving forwards.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	popOnForward: false,

	/**
	* The amount of time, in milliseconds, to run the transition animation between panels.
	*
	* @type {Number}
	* @default 250
	* @public
	*/
	duration: 250,

	/**
	* The timing function to be applied to the transition animation between panels. Please refer
	* to https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function.
	*
	* @type {String}
	* @default 'ease-out'
	* @public
	*/
	timingFunction: 'ease-out',

	/**
	* The orientation of the panels. Possible values from
	* {@link module:moonstone/LightPanels~Orientation}.
	*
	* @type {String}
	* @default Orientation.HORIZONTAL
	* @public
	*/
	orientation: Orientation.HORIZONTAL,

	/**
	* The direction of the panel movement. Possible values from
	* {@link module:moonstone/LightPanels~Direction}.
	*
	* @type {String}
	* @default Direction.FORWARDS
	* @public
	*/
	direction: Direction.FORWARDS,

	/**
	* @private
	*/
	components: [
		{kind: Control, name: 'client', classes: 'panels-container', ontransitionend: 'transitionFinished'}
	],

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.updateTransforms();
			this.orientationChanged();
			this.directionChanged();
			this.indexChanged();
		};
	}),



	/*
		===============
		Change handlers
		===============
	*/

	/**
	* @private
	*/
	directionChanged: function (was) {
		var key, value;
		for (key in Direction) {
			value = Direction[key];
			if (value == was) this.removeClass(key.toLowerCase());
			if (value == this.direction) this.addClass(key.toLowerCase());
		}
	},

	/**
	* @private
	*/
	orientationChanged: function (was) {
		var key, value;
		for (key in Orientation) {
			value = Orientation[key];
			if (value == was) this.removeClass(key.toLowerCase());
			if (value == this.orientation) this.addClass(key.toLowerCase());
		}
	},

	/**
	* @private
	*/
	durationChanged: function () {
		this.updateTransforms();
	},

	/**
	* @private
	*/
	timingFunctionChanged: function () {
		this.updateTransforms();
	},


	/**
	* @private
	*/
	indexChanged: function (was) {
		this.setupTransitions(was);
	},



	/*
		=======================
		Public accessor methods
		=======================
	*/

	/**
	* Retrieves the currently displayed panel.
	*
	* @return {Object} The currently displayed panel.
	* @public
	*/
	getActivePanel: function () {
		return this._currentPanel;
	},

	/**
	* Retrieves the panels currently part of this control.
	*
	* @return {Array} The set of panels.
	* @public
	*/
	getPanels: function () {
		/*jshint -W093 */
		return (this._panels = this._panels || (this.controlParent || this).children);
	},



	/*
		=====================
		Public action methods
		=====================
	*/

	/**
	* Animates to the specified panel index.
	*
	* @param {Number} index - The index of the panel we wish to animate a transition to.
	* @public
	*/
	animateTo: function (index) {
		var from = this.index;
		this.index = index;
		this.setupTransitions(from, true);
	},

	/**
	* Transitions to the previous panel--i.e., the panel whose index value is one
	* less than that of the current active panel.
	*
	* @public
	*/
	previous: function () {
		var prevIndex = this.index - 1;
		if (this.wrap && prevIndex < 0) {
			prevIndex = this.getPanels().length - 1;
		}
		if (prevIndex >= 0) {
			if (this.animate) this.animateTo(prevIndex);
			else this.set('index', prevIndex);
		}
	},

	/**
	* Transitions to the next panel--i.e., the panel whose index value is one
	* greater than that of the current active panel.
	*
	* @public
	*/
	next: function () {
		var nextIndex = this.index + 1;
		if (this.wrap && nextIndex >= this.getPanels().length) {
			nextIndex = 0;
		}
		if (nextIndex < this.getPanels().length) {
			if (this.animate) this.animateTo(nextIndex);
			else this.set('index', nextIndex);
		}
	},

	/**
	* Creates a panel on top of the stack and increments index to select that component.
	*
	* @param {Object} info - The declarative {@glossary kind} definition.
	* @param {Object} moreInfo - Additional properties to be applied (defaults).
	* @param {module:enyo/LightPanels~PushPanelOptions} opts - Additional options to be used during
	*	panel pushing.
	* @return {Object} The instance of the panel that was created on top of the stack.
	* @public
	*/
	pushPanel: function (info, moreInfo, opts) {
		if (this.transitioning) return;

		if (opts && opts.purge) {
			this.purge();
		}

		var lastIndex = this.getPanels().length - 1,
			nextPanel = this.createPanel(info, moreInfo),
			newIndex = lastIndex + 1;
		if (this.cacheViews) {
			this.pruneQueue([info]);
		}

		nextPanel.render();

		if (opts && opts.forcePostTransition && nextPanel.postTransition) {
			nextPanel.postTransition();
		}

		if (!this.animate || (opts && opts.direct)) this.set('index', newIndex);
		else this.animateTo(newIndex);

		// TODO: When pushing panels after we have gone back (but have not popped), we need to
		// adjust the position of the panels after the previous index before our push.
		return nextPanel;
	},

	/**
	* Creates multiple panels on top of the stack and updates index to select the last one
	* created. Supports an optional `opts` object as the third parameter.
	*
	* @param {Object[]} info - The declarative {@glossary kind} definitions.
	* @param {Object} moreInfo - Additional properties to be applied (defaults).
	* @param {module:enyo/LightPanels~PushPanelOptions} opts - Additional options to be used when
	*	pushing multiple panels.
	* @return {null|Object[]} Array of the panels that were created on top of the stack, or
	*	`null` if panels could not be created.
	* @public
	*/
	pushPanels: function (info, moreInfo, opts) {
		if (this.transitioning) return true;

		if (opts && opts.purge) {
			this.purge();
		}

		var lastIndex = this.getPanels().length,
			newPanels = [],
			newPanel, targetIdx, compareIdx, idx;

		for (idx = 0; idx < info.length; idx++) {
			newPanel = this.createPanel(info[idx], moreInfo);
			newPanels.push(newPanel);
			if ((opts && opts.targetIndex != null && lastIndex + idx == opts.targetIndex) || idx == info.length - 1) {
				newPanel.render();
			} else {
				compareIdx = opts && opts.targetIndex != null ? opts.targetIndex : lastIndex + info.length;
				this.shiftContainer(compareIdx - this.index);
			}
			if (opts && opts.forcePostTransition && newPanel.postTransition) {
				newPanel.postTransition();
			}
		}
		if (this.cacheViews) {
			this.pruneQueue(info);
		}

		targetIdx = (opts && opts.targetIndex != null) ? opts.targetIndex : lastIndex + newPanels.length - 1;

		if (!this.animate || (opts && opts.direct)) this.set('index', targetIdx);
		else this.animateTo(targetIdx);

		return newPanels;
	},

	/**
	* Destroys panels whose index is either greater than, or less than, the specified value,
	* depending on the direction.
	*
	* @param {Number} index - Index at which to start destroying panels.
	* @param {Number} direction - The direction in which we want to destroy panels. A negative
	*	number signifies popping backwards, otherwise we pop forwards.
	* @public
	*/
	popPanels: function (index, direction) {
		var panels = this.getPanels();

		if (direction < 0) {
			while (panels.length > index + 1 && index >= 0) {
				this.popPanel(panels.length - 1);
			}
		} else {
			for (var panelIndex = index - 1; panelIndex >= 0; panelIndex--) {
				this.popPanel(panelIndex, true);
			}
		}
	},

	/**
	* Destroys the specified panel.
	*
	* @param {Number} index - The index of the panel to destroy.
	* @param {Boolean} [preserve] - If {@link module:enyo/LightPanels~LightPanels#cacheViews} is `true`, this
	*	value is used to determine whether or not to preserve the current panel's position in
	*	the component hierarchy and on the screen, when caching.
	* @public
	*/
	popPanel: function (index, preserve) {
		var panels = this.getPanels(),
			panel = panels[index];

		if (panel) {
			if (this.cacheViews) {
				this.cacheView(panel, preserve);
			} else {
				panel.destroy();
			}
		}
	},



	/*
		============================================================
		Public methods implementing the ViewPreloadSupport interface
		============================================================
	*/

	/**
	* Determines the id of the given view.
	*
	* @param {Object} view - The view whose id we will determine.
	* @return {String} The id of the given view.
	* @public
	*/
	getViewId: function (view) {
		return view.panelId;
	},



	/*
		======================================
		Public methods for queued task support
		======================================
	*/

	/**
	* Enqueues a view that will eventually be pre-cached at an opportunistic time.
	*
	* @param {String} viewProps - The properties of the view to be enqueued.
	* @param {Number} [priority] - The priority of the job.
	* @public
	*/
	enqueuePanel: function (viewProps, priority) {
		var viewId = this.getViewId(viewProps);
		if (!this.isViewPreloaded(viewId)) {
			this.addTask(function () {
				// TODO: once the data layer is hooked into the run loop, we should no longer need
				// to forcibly trigger the post transition work.
				this.preCacheView(viewProps, {}, function (view) {
					if (view.postTransition) {
						view.postTransition();
					}
				});
			}, priority || this.defaultPriority, viewId);
		}
	},

	/**
	* Enqueues a set of views that will eventually be pre-cached at an opportunistic time.
	*
	* @param {Array} viewPropsArray - A set of views to be enqueued.
	* @param {Number} [priority] - The priority of the job.
	* @public
	*/
	enqueuePanels: function (viewPropsArray, priority) {
		for (var idx = 0; idx < viewPropsArray.length; idx++) {
			this.enqueuePanel(viewPropsArray[idx], priority);
		}
	},



	/*
		=================
		Protected methods
		=================
	*/

	/**
	* Determines whether or not we should animate the panel transition.
	*
	* @return {Boolean} If `true`, the panels should animate.
	* @protected
	*/
	shouldAnimate: function () {
		return this.generated && this.getPanels().length > 1 && this.animate;
	},



	/*
		=======================
		Private support methods
		=======================
	*/

	/**
	* Updates the transform style strings we will apply to the panel container.
	*
	* @private
	*/
	updateTransforms: function () {
		trans = 'transform ' + this.duration + 'ms ' + this.timingFunction;
		wTrans = '-webkit-' + trans;
	},

	/**
	* Cleans-up the given panel, usually after the transition has completed.
	*
	* @param {Object} panel - The panel we wish to clean-up.
	* @private
	*/
	cleanUpPanel: function (panel) {
		if (panel) {
			panel.set('state', panel === this._currentPanel ? States.ACTIVE : States.INACTIVE);
			if (panel.postTransition) {
				// Async'ing this as it seems to improve ending transition performance on the TV.
				// Requires further investigation into its behavior.
				asyncMethod(this, function () {
					panel.postTransition();
				});
			}
		}
	},

	/**
	* Determines whether or not we are removing inactive panels from DOM.
	* @returns {Boolean} If `true`, inactive panels are being removed; `false` otherwise.
	* @private
	*/
	removesPanels: function () {
		return this.cacheViews || this.popOnBack || this.popOnForward;
	},

	/**
	* When the transition has completed, we perform some clean-up work.
	*
	* @param {Object} sender - The event sender.
	* @param {Object} ev - The event object.
	* @param {Boolean} [direct] - If `true`, this was a non-animated (direct) transition.
	* @private
	*/
	transitionFinished: function (sender, ev, direct) {
		var prevPanel, currPanel;

		if (this.transitioning && ((ev && ev.originator === this.$.client) || direct)) {
			prevPanel = this._previousPanel;
			currPanel = this._currentPanel;

			if ((this._indexDirection < 0 && (this.popOnBack || this.cacheViews) && this.index < this.getPanels().length - 1) ||
				(this._indexDirection > 0 && (this.popOnForward || this.cacheViews) && this.index > 0)) {
				this.popPanels(this.index, this._indexDirection);
			} else if (prevPanel && !this.removesPanels()) {
				prevPanel.set('showing', false);
			}

			if (this.popQueue && this.popQueue.length) this.finalizePurge();

			this.cleanUpPanel(prevPanel);
			this.cleanUpPanel(currPanel);

			// Async'ing this as it seems to improve ending transition performance on the TV.
			// Requires further investigation into its behavior.
			asyncMethod(this, function () {
				this.removeClass('transitioning');
				this.transitioning = false;
			});
		}
	},

	/**
	* Retrieves a cached panel or, if not found, creates a new panel
	*
	* @param {Object} info - The declarative {@glossary kind} definition.
	* @param {Object} moreInfo - Additional properties to be applied (defaults).
	* @return {Object} - Found or created control
	* @private
	*/
	createPanel: function (info, moreInfo) {
		var panel,
			panelId = this.getViewId(info);

		if (this.cacheViews && panelId) {
			panel = this.restoreView(panelId);
		}

		panel = panel || this.createComponent(info, moreInfo);
		return panel;
	},

	/**
	* Sets up the transitions between the current and next panel.
	*
	* @param {Number} previousIndex - The index of the panel we are transitioning from.
	* @param {Boolean} animate - Whether or not there should be a visible animation when
	*	transitioning between the current and next panel.
	* @private
	*/
	setupTransitions: function (previousIndex, animate) {
		var panels = this.getPanels(),
			nextPanel = panels[this.index],
			currPanel = this._currentPanel;

		if (previousIndex != -1) this._indexDirection = this.index - previousIndex;
		else this._indexDirection = 0;

		if (nextPanel) {
			this.transitioning = true;
			this.addClass('transitioning');

			if (currPanel) {
				currPanel.set('state', States.INACTIVE);
				if (currPanel.preTransition) currPanel.preTransition();
			}

			// prepare the panel that will be transitioned into view
			if (!this.removesPanels()) nextPanel.set('showing', true);
			if (!nextPanel.generated) nextPanel.render();

			nextPanel.set('state', States.ACTIVE);
			if (nextPanel.preTransition) nextPanel.preTransition();

			// ensure our panel container is in the correct, pre-transition position
			this.shiftContainer(-1 * this._indexDirection);

			// set the correct state for the next panel
			nextPanel.set('state', States.ACTIVATING);
			nextPanel.addRemoveClass('next', this._indexDirection > 0);
			nextPanel.addRemoveClass('previous', this._indexDirection < 0);

			if (currPanel) {
				// set the correct state for the previous panel
				this._currentPanel.set('state', States.DEACTIVATING);
				currPanel.addRemoveClass('previous', this._indexDirection > 0);
				currPanel.addRemoveClass('next', this._indexDirection < 0);
			}

			// only animate transition if there is more than one panel and/or we're animating
			if (animate) {
				setTimeout(this.bindSafely(function () {
					this.applyTransitions(nextPanel, true);
				}), 16);
			} else {
				this.applyTransitions(nextPanel);
			}
		}
	},

	/**
	* Applies the transitions for moving between the current and next panel.
	*
	* @param {Object} nextPanel - The panel we are transitioning to.
	* @param {Boolean} animate - If `true`, signifies that this is an animated transition.
	* @private
	*/
	applyTransitions: function (nextPanel, animate) {
		// move the panel container to its intended post-transition position
		if (this._currentPanel) this.shiftContainer(this._indexDirection, animate);

		// update our panel references
		this._previousPanel = this._currentPanel;
		this._currentPanel = nextPanel;

		// ensure that `transitionFinished` is called in the case where we are not animating
		if (!this.shouldAnimate() || !animate) this.transitionFinished(null, null, true);
	},

	/**
	* Shifts the given panel into its post-transition position.
	*
	* @param {Number} indexDirection - The direction (positive indicates forward, negative
	*	backwards) in which we are changing the index.
	* @param {Boolean} [animate] - Whether or not we want this shift to be animated.
	* @private
	*/
	shiftContainer: function (indexDirection, animate) {
		var container = this.$.client,
			value = (indexDirection > 0 ? -50 : 0) * this.direction + '%';

		container.applyStyle('-webkit-transition', animate ? wTrans : null);
		container.applyStyle('transition', animate ? trans: null);

		dom.transformValue(container, 'translate' + this.orientation, value);
	},

	/**
	* Destroys all panels. These will be queued for destruction after the next panel has loaded.
	*
	* @private
	*/
	purge: function () {
		var panels = this.getPanels();
		this.popQueue = panels.slice();
		panels.length = 0;
		this.index = -1;
	},

	/**
	* Clean-up any panels queued for destruction.
	*
	* @private
	*/
	finalizePurge: function () {
		var panels = this.popQueue,
			panel;
		while (panels.length) {
			panel = panels.pop();
			if (this.cacheViews) {
				this.cacheView(panel);
			}
			else {
				panel.destroy();
			}
		}
	},

	/**
	* Prunes the queue of to-be-cached panels in the event that any panels in the queue have
	* already been instanced.
	*
	* @param {String} viewProps - The properties of the view to be enqueued.
	* @private
	*/
	pruneQueue: function (viewProps) {
		for (var idx = 0; idx < viewProps.length; idx++) {
			this.removeTask(this.getViewId(viewProps[idx]));
		}
	}
});

module.exports.Panel = LightPanel;
module.exports.Direction = Direction;
module.exports.Orientation = Orientation;