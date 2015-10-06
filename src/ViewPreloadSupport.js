/**
* Exports the {@link module:enyo/ViewPreloadSupport~ViewPreloadSupport} mixin
* @module enyo/ViewPreloadSupport
*/
var
	kind = require('./kind'),
	utils = require('./utils');

var
	Control = require('./Control');

/**
* A {@glossary mixin} used for preloading views.
*
* @mixin
* @private
*/
var ViewPreloadSupport = {

	/**
	* @private
	*/
	name: 'enyo.ViewPreloadSupport',

	/**
	* When `true`, existing views are cached for reuse; otherwise, they are destroyed.
	*
	* @name cacheViews
	* @type {Boolean}
	* @default undefined
	* @public
	*/

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);

			// initialize properties
			this.cacheViews = utils.exists(this.cacheViews) ? this.cacheViews : true;

			if (this.cacheViews) {
				// we don't want viewCache to be added to the client area, so we cache the original
				// controlParent and restore it afterward
				var cp = this.controlParent;
				this.controlParent = null;
				this.createChrome([
					{name: 'viewCache', kind: Control, canGenerate: false}
				]);
				this.controlParent = cp;

				this.removeChild(this.$.viewCache);
				this._cachedViews = {};
			}
		};
	}),


	/*
		===================================
		Interface methods to be implemented
		===================================
	*/

	/**
	* Determines the id of the given view. This is something that should generally be
	* implemented in the actual kind as this will vary from case to case.
	*
	* @param {Object} view - The view whose id we will determine.
	* @return {String} The id of the given view.
	* @public
	*/
	getViewId: kind.inherit(function (sup) {
		return function (view) {
			return sup.apply(this, arguments);
		};
	}),

	/**
	* Reset the state of the given view. This is something that should generally be implemented
	* in the actual kind.
	*
	* @param {Object} view - The view whose state we wish to reset.
	* @private
	*/
	resetView: kind.inherit(function (sup) {
		return function (view) {
			return sup.apply(this, arguments);
		};
	}),



	/*
		==============
		Public methods
		==============
	*/

	/**
	* Caches a given view so that it can be quickly instantiated and utilized at a later point.
	* This is typically performed on a view which has already been rendered and which no longer
	* needs to remain in view, but may be revisited at a later time.
	*
	* @param {Object} view - The view to cache for later use.
	* @param {Boolean} preserve - If `true`, preserves the view's position both on the screen
	*	and within the component hierarchy.
	* @public
	*/
	cacheView: function (view, preserve) {
		var id = this.getViewId(view);

		// The panel could have already been removed from DOM and torn down if we popped when
		// moving forward.
		if (view.hasNode()) {
			view.removeNodeFromDom();
			view.teardownRender(true);
		}

		if (!preserve) {
			this.resetView(view);

			this.removeControl(view);
			this.$.viewCache.addControl(view);
		}

		this._cachedViews[id] = view;
	},

	/**
	* Restores the specified view that was previously cached.
	*
	* @param {String} id - The unique identifier for the cached view that is being restored.
	* @return {Object} The restored view.
	* @public
	*/
	restoreView: function (id) {
		var cp = this._cachedViews,
			view = cp[id];

		if (view) {
			this.$.viewCache.removeControl(view);
			this.addControl(view);

			this._cachedViews[id] = null;
		}

		return view;
	},

	/**
	* Pre-caches a set of views by creating and caching them, even if they have not yet been
	* rendered into view. This is helpful for reducing the instantiation time for views which
	* have yet to be shown, but can and eventually will be shown to the user.
	*
	* @param {Object} info - The declarative {@glossary kind} definition.
	* @param {Object} commonInfo - Additional properties to be applied (defaults).
	* @param {Boolean} [cbEach] - If specified, this callback will be executed once for each view
	*	that is created, with the created view being passed as a parameter.
	* @param {Boolean} [cbComplete] - If specified, this callback will be executed after all of the
	*	views have been created, with the created views being passed as a parameter.
	* @return {Object[]} The set of view components that were created.
	* @public
	*/
	preCacheViews: function(info, commonInfo, cbEach, cbComplete) {
		var views = [],
			i;

		for (i = 0; i < info.length; i++) {
			views.push(this.preCacheView(info[i], commonInfo, cbEach));
		}
		if (cbComplete) {
			cbComplete.call(this, views);
		}

		return views;
	},

	/**
	* Pre-caches a single view by creating and caching the view, even if it has not yet been
	* rendered into view. This is helpful for reducing the instantiation time for panels which
	* have yet to be shown, but can and eventually will be shown to the user.
	*
	* @param {Object} info - The declarative {@glossary kind} definition.
	* @param {Object} commonInfo - Additional properties to be applied (defaults).
	* @param {Function} [cbComplete] - If specified, this callback will be executed, with the
	*	created view being passed as a parameter.
	* @return {Object} The view component that was created.
	* @public
	*/
	preCacheView: function(info, commonInfo, cbComplete) {
		var viewId = this.getViewId(info),
			vc, view;

		if (!this.isViewPreloaded(viewId)) {
			vc = this.$.viewCache;
			commonInfo = commonInfo || {};
			commonInfo.owner = this;
			view = vc.createComponent(info, commonInfo);
			this._cachedViews[viewId] = view;
			if (cbComplete) {
				cbComplete.call(this, view);
			}
		}

		return view;
	},

	/**
	* Determines whether or not a given view has already been pre-loaded.
	*
	* @param {Object} viewId - The id of the view whose pre-load status is being determined.
	* @return {Boolean} If `true`, the view has already been pre-loaded; `false` otherwise.
	* @public
	*/
	isViewPreloaded: function (viewId) {
		return !!(viewId && this._cachedViews[viewId]);
	}

};

module.exports = ViewPreloadSupport;
