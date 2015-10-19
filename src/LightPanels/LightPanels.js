require('enyo');

/**
* Contains the declaration for the {@link module:enyo/LightPanels~LightPanels} kind.
* @module enyo/LightPanels
*/

var
	kind = require('../kind'),
	dom = require('../dom'),
	animation = require('../animation'),
	utils = require('../utils');

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
* @typedef {Object} enyo/LightPanels~LightPanels~PushPanelOptions
* @property {Boolean} [direct] - If `true`, the transition to the panel whose index we are
*	changing to will not be animated.
* @property {Boolean} [forcePostTransition] - If `true`, forces post-transition work to be run
*	immediately after each panel is created.
* @property {Number} [targetIndex] - The index of the panel to display, otherwise the last panel
*	created will be displayed.
* @property {Boolean} [purge] - If `true`, removes and clears the existing set of panels before
*	pushing new panels.
* @property {Boolean} [force] - If `true`, forces an index change even if we are targetting an index
*	that is the same as the current index. This can be useful in cases where we are purging panels
*	and want to properly setup the positioning of the newly pushed panels.
*/

/**
* A lightweight panels implementation that has basic support for CSS transitions between child
* components.
*
* @class LightPanels
* @extends module:enyo/Control~Control
* @mixes module:enyo/TaskManagerSupport~TaskManagerSupport
* @mixes module:enyo/ViewPreloadSupport~ViewPreloadSupport
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
	* @default 0
	* @public
	*/
	index: 0,

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
	* The amount of time, in milliseconds, to run the transition animation between panels.
	*
	* @type {Number}
	* @default 250
	* @public
	*/
	duration: 250,

	/**
	* The timing function to be applied to the transition animation between panels. Please refer
	* to {@linkplain https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function}.
	*
	* @type {String}
	* @default 'ease-out'
	* @public
	*/
	timingFunction: 'ease-out',

	/**
	* The orientation of the panels. Possible values from
	* {@link module:enyo/LightPanels~LightPanels#Orientation}.
	*
	* @type {String}
	* @default {@link module:enyo/LightPanels~LightPanels#Orientation.HORIZONTAL}
	* @public
	*/
	orientation: Orientation.HORIZONTAL,

	/**
	* The direction of the panel movement. Possible values from
	* {@link module:enyo/LightPanels~LightPanels#Direction}.
	*
	* @type {String}
	* @default {@link module:enyo/LightPanels~LightPanels#Direction.FORWARDS}
	* @public
	*/
	direction: Direction.FORWARDS,

	/**
	* Whether or not to reverse the panel animation when the directionality changes (i.e., rtl). Note
	* that the animation is only reversed if {@link module:enyo/LightPanels~LightPanels} is in a
	* [horizontal orientation]{@link module:enyo/LightPanels~LightPanels#Orientation.HORIZONTAL}.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	reverseForRtl: false,

	/**
	* @private
	*/
	tools: [
		{kind: Control, name: 'client', classes: 'panels-container', ontransitionend: 'transitionFinished', onwebkitTransitionEnd: 'transitionFinished'}
	],

	/**
	* @private
	*/
	create: function () {
		Control.prototype.create.apply(this, arguments);
		this.updateTransforms();
		this.orientationChanged();
		this.directionChanged();
		this.animateChanged();
		if (!this.getPanels().length) this.index = -1;
		this.setupTransitions();
	},

	/**
	* @private
	*/
	initComponents: function() {
		this.createChrome(this.tools);
		Control.prototype.initComponents.apply(this, arguments);
	},

	/**
	* @private
	*/
	addChild: function (control) {
		Control.prototype.addChild.apply(this, arguments);
		if (control.parent === this.$.client) control.addClass('offscreen');
	},



	/*
		===============
		Change handlers
		===============
	*/

	/**
	* @private
	*/
	directionChanged: function (was) {
		var shouldReverse = this.reverseForRtl && this.rtl && this.orientation == Orientation.HORIZONTAL,
			key, value;

		// Set internal direction property that respects RTL, if desired
		this._direction = this.direction * (shouldReverse ? -1 : 1);

		for (key in Direction) {
			value = Direction[key];
			if (value == was) this.removeClass(key.toLowerCase());
			if (value == this._direction) this.addClass(key.toLowerCase());
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
	animateChanged: function () {
		dom.transform(this.$.client, {translateZ: this.animate ? 0 : null});
	},

	/**
	* @private
	*/
	indexChanged: function (was, is, nom, opts) {
		// when notifyObservers is called without arguments, we do not need to do any work here
		// (since there's no transition required with the indices are the same)
		if (was !== is || (opts && opts.force)) {
			this.setupTransitions(was);
		}
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
		this.notifyObservers('index');
		this.setupTransitions(from, true);
	},

	/**
	* Transitions to the previous panel--i.e., the panel whose index value is one
	* less than that of the current active panel.
	*
	* @public
	*/
	previous: function () {
		if (!this.transitioning) {
			var prevIndex = this.index - 1;
			if (this.wrap && prevIndex < 0) {
				prevIndex = this.getPanels().length - 1;
			}
			if (prevIndex >= 0) {
				if (this.animate) this.animateTo(prevIndex);
				else this.set('index', prevIndex);
			}
		}
	},

	/**
	* Transitions to the next panel--i.e., the panel whose index value is one
	* greater than that of the current active panel.
	*
	* @public
	*/
	next: function () {
		if (!this.transitioning) {
			var nextIndex = this.index + 1;
			if (this.wrap && nextIndex >= this.getPanels().length) {
				nextIndex = 0;
			}
			if (nextIndex < this.getPanels().length) {
				if (this.animate) this.animateTo(nextIndex);
				else this.set('index', nextIndex);
			}
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

		if (!this.animate || (opts && opts.direct)) this.set('index', newIndex, {force: opts && opts.force});
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

		if (!this.animate || (opts && opts.direct)) this.set('index', targetIdx, {force: opts && opts.force});
		else this.animateTo(targetIdx);

		return newPanels;
	},

	/**
	* Removes panels whose index is either greater than, or less than, the specified value,
	* depending on the direction.
	*
	* @param {Number} index - Index at which to start removing panels.
	* @param {Number} direction - The direction in which we are changing indices. A negative value
	*	signifies that we are moving backwards, and want to remove panels whose indices are greater
	*	than the current index. Conversely, a positive value signifies that we are moving forwards,
	*	and panels whose indices are less than the current index should be removed.
	* @public
	*/
	removePanels: function (index, direction) {
		var panels = this.getPanels(),
			i;

		if (direction < 0) {
			for (i = panels.length - 1; i > index; i--) {
				this.removePanel(panels[i]);
			}
		} else {
			for (i = 0; i < index; i++) {
				this.removePanel(panels[i], true);
			}
		}
	},

	/**
	* Removes the specified panel.
	*
	* @param {Object} panel - The panel to remove.
	* @param {Boolean} [preserve] - If {@link module:enyo/LightPanels~LightPanels#cacheViews} is
	*	`true`, this value is used to determine whether or not to preserve the current panel's
	*	position in the component hierarchy and on the screen, when caching.
	* @private
	*/
	removePanel: function (panel, preserve) {
		if (panel) {
			if (this.cacheViews) {
				this.cacheView(panel, preserve);
			} else {
				panel.destroy();
			}
		}
	},

	/**
	* Replaces the panel(s) at the specified index with panels that will be created via provided
	* component definition(s).
	*
	* @param {Number} start - The index where we wish to begin the replacement. If this is negative,
	*	it will be treated as `panelsLength` + `start` i.e. we will use the absolute value of the
	*	start index as a count from the end of the set of panels.
	* @param {Number} count - The number of panels we wish to replace.
	* @param {Object|Object[]} info - The component definition (or array of component definitions)
	*	for the replacement panel(s).
	* @public
	*/
	replaceAt: function (start, count, info) {
		var panels = this.getPanels(),
			insertBefore, commonInfo, end, idx;

		start = start < 0 ? panels.length + start : start;
		end = start + count;
		insertBefore = panels[end];
		commonInfo = {addBefore: insertBefore};

		// remove existing panels
		for (idx = start; idx < end; idx++) {
			this.removePanel(panels[idx]);
		}

		// add replacement panels
		if (utils.isArray(info)) this.pushPanels(info, commonInfo, {direct: true, force: true});
		else this.pushPanel(info, commonInfo, {direct: true, force: true});
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
				utils.asyncMethod(this, function () {
					panel.postTransition();
				});
			}
		}
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
				(this._indexDirection > 0 && this.cacheViews && this.index > 0)) {
				this.removePanels(this.index, this._indexDirection);
			}

			if (prevPanel) {
				prevPanel.removeClass('shifted');
				prevPanel.addClass('offscreen');
			}

			this.cleanUpPanel(prevPanel);
			this.cleanUpPanel(currPanel);

			this.removeClass('transitioning');
			this.transitioning = false;
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
	* @param {Number} [previousIndex] - The index of the panel we are transitioning from.
	* @param {Boolean} [animate] - Whether or not there should be a visible animation when
	*	transitioning between the current and next panel.
	* @private
	*/
	setupTransitions: function (previousIndex, animate) {
		var panels = this.getPanels(),
			nextPanel = panels[this.index],
			currPanel = this._currentPanel,
			shiftCurrent, fnInitiateTransition;

		this._indexDirection = 0;

		// handle the wrapping case
		if (this.wrap) {
			if (this.index === 0 && previousIndex == panels.length - 1) this._indexDirection = 1;
			else if (this.index === panels.length - 1 && previousIndex === 0) this._indexDirection = -1;
		}
		if (this._indexDirection === 0 && previousIndex != -1) this._indexDirection = this.index - previousIndex;

		if (nextPanel) {
			this.transitioning = true;

			// prepare the panel that will be deactivated
			if (currPanel) {
				currPanel.set('state', States.DEACTIVATING);
				if (currPanel.preTransition) currPanel.preTransition();
			}

			// prepare the panel that will be activated
			nextPanel.set('state', States.ACTIVATING);
			if (!nextPanel.generated) nextPanel.render();
			if (nextPanel.preTransition) nextPanel.preTransition();

			fnInitiateTransition = this.bindSafely(function (timestamp) {

				// ensure our panel container is in the correct, pre-transition position
				this.shiftContainer(-1 * this._indexDirection);
				shiftCurrent = this._indexDirection > 0;

				this.addClass('transitioning');
				nextPanel.removeClass('offscreen');
				nextPanel.addRemoveClass('shifted', shiftCurrent);
				if (currPanel) currPanel.addRemoveClass('shifted', !shiftCurrent);

				// timestamp will be truthy if this is triggered from a rAF
				if (timestamp) animation.requestAnimationFrame(this.bindSafely('applyTransitions', nextPanel, animate));
				else this.applyTransitions(nextPanel, animate);
			});

			if (!this.generated || !animate) fnInitiateTransition();
			else animation.requestAnimationFrame(fnInitiateTransition);
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
			value;

		if (this._direction == Direction.FORWARDS) value = indexDirection > 0 ? -50 : 0;
		else value = indexDirection > 0 ? 0 : -50;

		container.applyStyle('-webkit-transition', animate ? wTrans : null);
		container.applyStyle('transition', animate ? trans: null);

		dom.transformValue(container, 'translate' + this.orientation, value + '%');
	},

	/**
	* Destroys all panels.
	*
	* @private
	*/
	purge: function () {
		var panels = this.getPanels(),
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

		this.index = -1;
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
