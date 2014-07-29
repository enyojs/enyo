(function (enyo, scope) {
	/**
	* The [event]{@glossary event} [object]{@glossary Object} that is provided when the 
	* [paging]{@link enyo.DataList#paging} [event]{@glossary event} is fired.
	*
	* @typedef {Object} enyo.DataList~PagingEvent
	* @property {Number} start The lowest active index in the dataset.
	* @property {Number} end The highest active index.
	* @property {String} action The _action_ that triggered the paging, either "scroll" or "reset".
	*/

	/**
	* Fires each time data has been paged, on a per-page basis.
	*
	* @event enyo.DataList#paging
	* @type {Object}
	* @property {Object} sender - A reference to the {@link enyo.DataList}.
	* @property {String} nom The name of the [event]{@glossary event}.
	* @property {enyo.DataList~PagingEvent} event - A [hash]{@glossary Object} with properties
	*	specific to the [paging]{@link enyo.DataList#paging} [event]{@glossary event}.
	* @public
	*/

	/**
	* `enyo.DataList` is an {@link enyo.DataRepeater} that employs a paginated scrolling scheme to
	* enhance performance with larger datasets. The data is provided to the 
	* [DataList]{@link enyo.DataList} by an {@link enyo.Collection} set as the value of its 
	* [collection]{@link enyo.DataRepeater#collection} property.
	* 
	* Note that care should be taken when deciding how to lay out the list's children. When there 
	* are a large number of child [elements]{@link enyo.Control}, the layout process can be taxing 
	* and non-performant for the browser. Avoid	dynamically-updated [layouts]{@glossary layout}
	* that require lots of calculations each time the data in a view is updated. Try to use CSS 
	* whenever possible.
	* 
	* While paging through data, `enyo.DataList` emits the
	* [_paging_]{@link enyo.DataList#paging} [event]{@glossary event}, which allows you 
	* to make updates on a per-page basis, as necessary. You may register for this 
	* [event]{@glossary event} by calling [_addListener()_]{@link enyo.EventEmitter#addListener}
	* and specifying the [event]{@glossary event}, along with a callback method.
	*
	* @ui
	* @class enyo.DataList
	* @extends enyo.DataRepeater
	* @public
	*/
	enyo.kind(
		/** @lends enyo.DataList.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.DataList',

		/**
		* @private
		*/
		kind: enyo.DataRepeater,

		/**
		* `enyo.DataList` places its rows inside of a [scroller]{@link enyo.Scroller}. Any
		* configurable options of [`enyo.Scroller`]{@link enyo.Scroller} may be placed in this
		* [hash]{@glossary Object}; their values will be set accordingly on this 
		* [list's]{@link enyo.DataList} [scroller]{@link enyo.Scroller}. If no options are specified,
		* the default [`enyo.Scroller`]{@link enyo.Scroller} settings are used.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		scrollerOptions: null,

		/**
		* The paging _orientation_. Valid values are `'vertical'` and `'horizontal'`. This property 
		* will be mapped to a particular strategy governing how the list will flow.
		*
		* @type {String}
		* @default 'vertical'
		* @public
		*/
		orientation: 'vertical',

		/**
		* This is typically handled automatically, but some platforms may benefit from having a 
		* larger or smaller value here. If there is a number here, it will be multiplied by the 
		* available viewport size (depending on orientation) to determine the minimum page size. The
		* page size is directly related to the number of [controls]{@link enyo.Control} that are 
		* generated at any given time (and that subsequently need updating) whenever paging occurs. 
		* This number may be any rational number greater than `1.2`.
		*
		* @type {Number}
		* @default 1.2
		* @public
		*/
		pageSizeMultiplier: null,

		/**
		* It is helpful for performance if the [list]{@link enyo.DataList} doesn't need to guess at 
		* the size of the children. In cases where all children are a fixed height/width (depending 
		* on the orientation of the [list]{@link enyo.DataList}) you may explicitly define that 
		* value for the [list]{@link enyo.DataList} to use and bypass much of its guesswork. This 
		* value is a number that will be interpreted in pixels and applied to the primary size 
		* depending on [orientation]{@link enyo.DataList#orientation}: _height_ when `'vertical'` 
		* and _width_ when `'horizontal'`. Note this value is not applied to the children via CSS by
		* the [list]{@link enyo.DataList}.
		*
		* @type {Number}
		* @default null
		* @public
		*/
		fixedChildSize: null,

		/**
		* To disable the default smoothing-transitions (for supported platforms), set this flag to 
		* `false`.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		allowTransitions: true,

		/**
		* Because some systems perform poorly on initialization, there is a delay when we attempt to
		* actually draw the contents of a [DataList]{@link enyo.DataList}. Usually, you will not 
		* need to adjust this value (expressed in milliseconds). If _renderDelay_ is `null`, there 
		* will be no delay and rendering will take place synchronously. If _renderDelay_ is set to 
		* `0`, rendering will be done asynchronously.
		*
		* @type {Number}
		* @default 250
		* @public
		*/
		renderDelay: 250,

		/**
		* Completely resets the current [list]{@link enyo.DataList} such that it scrolls to the top 
		* of the scrollable region and regenerates all of its children. This is typically necessary 
		* only on initialization or if the entire dataset has been swapped out.
		*
		* @public
		*/
		reset: function () {
			if (this.get('absoluteShowing')) {
				// we can only reset if we've already rendered
				if (this.generated && this.$.scroller.generated) {
					this.delegate.reset(this);
				}
			} else {
				this._addToShowingQueue('reset', this.reset);
			}
		},

		/**
		* Unlike [_reset()_]{@link enyo.DataList#reset}, which tears down and regenerates the entire
		* [list]{@link enyo.DataList}, this method attempts to refresh the pages as they are against
		* the current dataset. This is much cheaper to call than 
		* [_reset()_]{@link enyo.DataList#reset}, but is primarily used internally.
		*
		* @public
		*/
		refresh: function (c, e) {
			if (this.get('absoluteShowing')) {
				if (this.hasRendered) {
					this.delegate.refresh(this);
				}
			} else {
				this._addToShowingQueue('refresh', this.refresh);
			}
		},
		
		/**
		* Pass in an integer within the bounds of the [lists's]{@link enyo.DataList} 
		* [collection]{@link enyo.DataRepeater#collection} to scroll to the position of that index 
		* in the [list]{@link enyo.DataList}.
		*
		* @param {Number} idx - The index in the [lists's]{@link enyo.DataList}
		*	[collection]{@link enyo.DataRepeater#collection} to scroll to.
		* @public
		*/
		scrollToIndex: function (idx) {
			var len = this.collection? this.collection.length: 0;
			if (idx >= 0 && idx < len) {
				if (this.get('absoluteShowing')) {
					this.delegate.scrollToIndex(this, idx);
				} else {
					this._addToShowingQueue('scrollToIndex', function () {
						this.delegate.scrollToIndex(this, idx);
					});
				}
			}
		},
		
		/**
		* @method
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.metrics       = {};
				this.metrics.pages = {};
				if (this.pageSizeMultiplier !== null && !isNaN(this.pageSizeMultiplier)) {
					this.pageSizeMultiplier = Math.max(1.2, this.pageSizeMultiplier);
				}
			};
		}),

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				// synchronize the showing and absoluteShowing properties as absoluteShowing is
				// an internal property that should not be true if showing is false
				this.absoluteShowing = this.showing;
				// if we can, we use transitions
				this.allowTransitionsChanged();
				// map the selected strategy to the correct delegate for operations
				// on the list, default to _vertical_ if none is provided or if it
				// could not be found
				this.delegate = this.ctor.delegates[this.orientation] || this.base.delegates.vertical;
				// if the delegate has an initialization routine execute it now before the
				// container and children are rendered
				if (this.delegate.initList) {
					this.delegate.initList(this);
				}
				sup.apply(this, arguments);
				// initialize the _pages_ array and add the pages to it
				this.pages = [this.$.page1, this.$.page2];
			};
		}),

		/**
		* @method
		* @private
		*/
		render: enyo.inherit(function (sup) {
			return function () {
				this.$.scroller.canGenerate = false;
				this.$.scroller.teardownRender();
				sup.apply(this, arguments);
			};
		}),

		/**
		* Attempts to perform initialization. There are only a few basic startup paths, but we need 
		* to be aware of what they are:
		* 
		* - The view is rendered, it has a collection, and the collection has data.
		* - The view is rendered, it has a collection with no data, and data is added
			later.
		* - The view is rendered, but has no collection.
		*
		* Once the [list]{@link enyo.DataList} itself is rendered, we check to see if we have a 
		* [collection]{@link enyo.Collection}; if so, do we have any data to start rendering the 
		* rest of the [list]{@link enyo.DataList}? Ultimately, the implementation decisions are 
		* decided by the [delegate]{@glossary delegate} strategy.
		* 
		* @private
		*/
		rendered: function () {
			if (this.get('absoluteShowing')) {
				// actually rendering a datalist can be taxing for some systems so
				// we arbitrarily delay showing for a fixed amount of time unless delay is
				// null in which case it will be executed immediately
				var startup = function () {
					// now that the base list is rendered, we can safely generate our scroller
					this.$.scroller.canGenerate = true;
					this.$.scroller.render();
					// and now we hand over the action to our strategy to let it initialize the
					// way it needs to
					this.delegate.rendered(this);
					this.hasRendered = true;
					// now add our class to adjust visibility (if no overridden)
					this.addClass('rendered');
					if (this.didRender) {
						this.didRender();
					}
				};
				if (this.renderDelay === null) {
					startup.call(this);
				} else {
					this.startJob('rendering', startup, this.renderDelay);
					// this delay will allow slower systems to keep going and get everything else
					// on screen before worrying about setting up the list
				}
			} else {
				this._addToShowingQueue('rendered', this.rendered);
			}
		},
		
		/**
		* @private
		*/
		_absoluteShowingChanged: function () {
			if (this.get('absoluteShowing')) {
				if (this._showingQueue && this._showingQueue.length) {
					var queue = this._showingQueue;
					var methods = this._showingQueueMethods;
					var fn;
					var name;
					this._showingQueue = null;
					this._showingQueueMethods = null;
					do {
						name = queue.shift();
						fn = methods[name];
						fn.call(this);
					} while (queue.length);
				}
			}
		},

		/**
		* @private
		*/
		_addToShowingQueue: function (name, fn) {
			var queue = this._showingQueue || (this._showingQueue = []);
			var methods = this._showingQueueMethods || (this._showingQueueMethods = {});
			var idx = enyo.indexOf(name, queue);
			if (idx >= 0) {
				queue.splice(idx, 1);
			}
			queue.push(name);
			methods[name] = fn;
		},
		/**
		* This [function]{@glossary Function} intentionally left blank. In 
		* [DataRepeater]{@link enyo.DataRepeater}, it removes the [control]{@link enyo.Control} at 
		* the specified index but that is handled by the [delegate]{@glossary delegate} here.
		* 
		* @private
		*/
		remove: function(idx) {},

		/**
		* Overloaded to call a method of the [delegate]{@glossary delegate} strategy.
		*
		* @private
		*/
		modelsAdded: function (c, e, props) {
			if (c === this.collection && this.$.scroller.canGenerate) {
				if (this.get('absoluteShowing')) {
					this.delegate.modelsAdded(this, props);
				} else {
					this._addToShowingQueue('refresh', function () {
						this.refresh();
					});
				}
			}
		},
		/**
		* Overloaded to call a method of the [delegate]{@glossary delegate} strategy.
		*
		* @private
		*/
		modelsRemoved: enyo.inherit(function(sup) {
			return function modelsRemoved(c, e, props) {
				if (c === this.collection && this.$.scroller.canGenerate) {
					if (this.get('absoluteShowing')) {
						this.delegate.modelsRemoved(this, props);
						sup.apply(this, arguments);
					} else {
						this._addToShowingQueue('refresh', function () {
							sup.apply(this, arguments);
							this.refresh();
						});
					}
				}
			};
		}),

		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				if (this.delegate && this.delegate.destroyList) {
					this.delegate.destroyList(this);
				}
				this._showingQueue = null;
				this._showingQueueMethods = null;
				sup.apply(this, arguments);
			};
		}),
		/**
		* Overloaded from base [kind]{@glossary kind} to ensure that the container options 
		* correctly apply the [scroller]{@link enyo.Scroller} options before instantiating it.
		*
		* @private
		*/
		initContainer: enyo.inherit(function (sup) {
			return function () {
				var o = enyo.clone(this.get('containerOptions')),
					s = this.get('scrollerOptions');
				if (s) { enyo.mixin(o, s, {exists: true}); }
				this.set('containerOptions', o);
				sup.apply(this, arguments);
			};
		}),
		/**
		* We let the [delegate]{@glossary delegate} strategy manage the 
		* [event]{@glossary event}, but we arbitrarily return `true` because we don't want the 
		* [event]{@glossary event} to propagate beyond this [kind]{@glossary kind}.
		*
		* @private
		*/
		didScroll: function (sender, event) {
			if (this.hasRendered && this.collection) {
				if (this.heightNeedsUpdate || this.widthNeedsUpdate) {
					// assign this here so that if for any reason it needs to
					// it can reset it
					this.heightNeedsUpdate = this.widthNeedsUpdate = false;
					this.refresh();
				}
				this.delegate.didScroll(this, event);
			}
			return true;
		},
		/**
		* Special override to handle resizing in an attempt to minimize the amount of work we're 
		* doing. We don't want to [waterfall]{@link enyo.Component#waterfall} the 
		* [event]{@glossary event} to all children, so we hijack the normal handler.
		*
		* @private
		*/
		didResize: function (sender, event) {
			if (this.get('absoluteShowing')) {
				if (this.hasRendered && this.collection) {
					if (this.heightNeedsUpdate || this.widthNeedsUpdate) {
						// assign this here so that if for any reason it needs to
						// it can reset it
						this.heightNeedsUpdate = this.widthNeedsUpdate = false;
						this.refresh();
					}
					this.delegate.didResize(this, event);
				}
			} else {
				this._addToShowingQueue('didResize', this.didResize);
			}
		},

		/**
		* @private
		*/
		showingChangedHandler: enyo.inherit(function (sup) {
			return function (inSender, inEvent) {
				this.set('absoluteShowing', this.getAbsoluteShowing(true));
				
				return sup.apply(this, arguments);
			};
		}),
		/**
		* Overload to adjust the root method to be able to find the nested child based on the 
		* requested index if its page is currently active. Returns `undefined` if the index is out 
		* of bounds or if the [control]{@link enyo.Control} is not currently available.
		* 
		* Also see [_getChildForIndex()_]{@link enyo.Repeater#getChildForIndex}, which calls this 
		* method.
		*
		* @private
		*/
		childForIndex: function (i) {
			return this.delegate.childForIndex(this, i);
		},
		
		/**
		* @private
		*/
		allowTransitionsChanged: function () {
			this.addRemoveClass('transitions', this.allowTransitions);
		},
		/**
		* [`enyo.DataList`]{@link enyo.DataList} uses an overloaded container from its base
		* [kind]{@glossary kind}. We set the container to a [scroller]{@link enyo.Scroller} and
		* provide a way to modify the [scroller]{@link enyo.Scroller} options (via the 
		* [_scrollerOptions_]{@link enyo.DataList#scrollerOptions} [hash]{@link enyo.Object}). All 
		* children will reside in one of the two pages owned by the [scroller]{@link enyo.Scroller}.
		*
		* @private
		*/
		containerOptions: {name: 'scroller', kind: 'enyo.Scroller', components: [
			{name: 'active', classes: 'active', components: [
				{name: 'page1', classes: 'page page1'},
				{name: 'page2', classes: 'page page2'},
				{name: 'buffer', classes: 'buffer'}
			]}
		], canGenerate: false, classes: 'enyo-fit enyo-data-list-scroller'},

		/**
		* We access this [kind's]{@glossary kind} [constructor]{@glossary constructor} and
		* need it to be undeferred at that time.
		* 
		* @private
		*/
		noDefer: true,

		/**
		* @private
		*/
		absoluteShowing: true,

		/**
		* All of the CSS is relative to this class.
		* 
		* @private
		*/
		classes: 'enyo-data-list',

		/**
		* Our initial _controlParent_ is us for the _flyweight_ child.
		* 
		* @private
		*/
		controlParentName: '',

		/**
		* Of course we set our container to `'scroller'` as needed by the base 
		* [kind]{@glossary kind}.
		* 
		* @private
		*/
		containerName: 'scroller',
		/**
		* We have to trap the Enyo-generated [_onScroll_]{@link enyo.Scroller#onScroll} 
		* [event]{@glossary event} and let the [delegate]{@glossary delegate} handle it. 
		* We also need to catch the _onresize_ [events]{@glossary event} so we know when to
		* update our cached sizing. We overload the default handler so that we don't 
		* [waterfall]{@link enyo.Component#waterfall} the resizing; we arbitrarily handle it to 
		* minimize the amount of work we do.
		*
		* @private
		*/
		handlers: {onScroll: 'didScroll', onresize: 'didResize'},

		/**
		* @private
		*/
		observers: [
			{method: '_absoluteShowingChanged', path: 'absoluteShowing'}
		],

		/**
		* Add the [RegisteredEventSupport]{@link enyo.RegisteredEventSupport} 
		* [mixin]{@glossary mixin} for the [paging]{@link enyo.DataList#paging} 
		* [event]{@glossary event}.
		* 
		* @private
		*/
		mixins: [enyo.RegisteredEventSupport],

		/**
		* All [delegates]{@glossary delegate} are named elsewhere but are stored in these 
		* statics.
		* 
		* @private
		*/
		statics: {delegates: {}},

		/**
		* An [array]{@glossary Array} of the actual _page_ references for easier access.
		* 
		* @private
		*/
		pages: null
	});

	/**
	* All subclasses of [`enyo.DataList`]{@link enyo.DataList} will have their own
	* [_delegates_]{@glossary delegate} static [hash]{@glossary Object}. This is per 
	* [_kind_]{@glossary kind}, not per _instance_.
	*
	* @private
	*/
	enyo.DataList.subclass = function (ctor) {
		ctor.delegates = enyo.clone(ctor.prototype.base.delegates || this.delegates);
	};

})(enyo, this);
