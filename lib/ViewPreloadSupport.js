(function (enyo, scope) {

	/** @lends enyo.ViewPreloadSupport.prototype */
	enyo.ViewPreloadSupport = {

		/**
		* @method
		* @private
		*/
		name: 'enyo.ViewPreloadSupport',

		/**
		* @private
		*/
		published: {

			/**
			* When `true`, existing views are cached for reuse, otherwise they are destroyed.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			cacheViews: true
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);

				if (this.cacheViews) {
					this.createChrome([
						{name: 'viewCache', kind: 'enyo.Control', canGenerate: false}
					]);
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
		getViewId: enyo.inherit(function (sup) {
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
		resetView: enyo.inherit(function (sup) {
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
			if (view.node) {
				view.node.remove();
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
		* @param {Boolean} [cbComplete] - If specified, this callback will be executed, with the
		*	created view being passed as a parameter.
		* @public
		*/
		preCacheViews: function(info, commonInfo, cbComplete) {
			var vc, views, i, view;

			if (this.cacheViews) {
				vc = this.$.viewCache;
				commonInfo = commonInfo || {};
				commonInfo.owner = this;
				views = vc.createComponents(info, commonInfo);
				for (i = 0; i < views.length; i++) {
					view = views[i];
					this._cachedViews[this.getViewId(view)] = view;
					if (cbComplete) {
						cbComplete.call(this, view);
					}
				}
			}
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
		* @public
		*/
		preCacheView: function(info, commonInfo, cbComplete) {
			var vc, view;

			if (this.cacheViews && !this._cachedViews[info.kind]) {
				vc = this.$.viewCache;
				commonInfo = commonInfo || {};
				commonInfo.owner = this;
				view = vc.createComponent(info, commonInfo);
				this._cachedViews[this.getViewId(info)] = view;
				if (cbComplete) {
					cbComplete.call(this, view);
				}
			}
		}

	};

})(enyo, this);