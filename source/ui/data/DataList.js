(function (enyo, scope) {
	/**
	* The {@glossary event} [object]{@glossary Object} that is provided when the
	* [paging]{@link enyo.DataList#paging} event is fired.
	*
	* @typedef {Object} enyo.DataList~PagingEvent
	* @property {Number} start - The lowest active index in the dataset.
	* @property {Number} end - The highest active index.
	* @property {String} action - The action that triggered the paging, either `'scroll'`
	* or `'reset'`.
	*/

	/**
	* Fires each time data is paged, on a per-page basis.
	*
	* @event enyo.DataList#paging
	* @type {Object}
	* @property {Object} sender - A reference to the {@link enyo.DataList}.
	* @property {String} nom - The name of the {@glossary event}.
	* @property {enyo.DataList~PagingEvent} event - A [hash]{@glossary Object} with properties
	*	specific to this event.
	* @public
	*/

	/**
	* When this property is specified, we force the static usage of this value instead of
	* dynamically calculating the number of controls per page based upon the viewport size.
	*
	* @name enyo.DataList#controlsPerPage
	* @type {Number}
	* @default undefined
	* @public
	*/

	/**
	* {@link enyo.DataList} is an {@link enyo.DataRepeater} that employs a paginated
	* scrolling scheme to enhance performance with larger datasets. The data is provided
	* to the DataList by an {@link enyo.Collection} set as the value of its
	* `collection` property and accessed by calling [data()]{@link enyo.DataRepeater#data}.
	*
	* Note that care should be taken when deciding how to lay out the list's children. When
	* there are a large number of child [elements]{@link enyo.Control}, the layout process
	* can be taxing and non-performant for the browser. Avoid dynamically-updated
	* [layouts]{@glossary layout} that require lots of calculations each time the data in a
	* view is updated. Try to use CSS whenever possible.
	*
	* While paging through data, `enyo.DataList` emits the
	* [paging]{@link enyo.DataList#paging} event, which allows you to make updates as
	* necessary, on a per-page basis. You may register for this event by calling
	* [addListener()]{@link enyo.EventEmitter#addListener} and specifying the event,
	* along with a callback method.
	*
	* @class enyo.DataList
	* @extends enyo.DataRepeater
	* @ui
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
		* {@link enyo.DataList} places its rows inside of a [scroller]{@link enyo.Scroller}.
		* Any configurable options of {@link enyo.Scroller} may be placed in the
		* `scrollerOptions` [hash]{@glossary Object}; their values will be set on the
		* DataList's scroller accordingly. If no options are specified, the default
		* `enyo.Scroller` settings will be used.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		scrollerOptions: null,

		/**
		* The paging orientation. Valid values are `'vertical'` and `'horizontal'`. This property
		* will be mapped to a particular strategy governing how the list will flow.
		*
		* @type {String}
		* @default 'vertical'
		* @public
		*/
		orientation: 'vertical',

		/**
		* While page sizing is typically handled automatically, some platforms may benefit from
		* having a larger or smaller value set for this property. If a number is specified, it
		* will be multiplied by the available viewport size (depending on
		* [orientation]{@link enyo.DataList#orientation}) to determine the minimum page size.
		* The page size is directly related to the number of [controls]{@link enyo.Control} that
		* are generated at any given time (and that subsequently need updating) whenever paging
		* occurs. This value may be any rational number greater than `1.2`.
		*
		* @type {Number}
		* @default 1.2
		* @public
		*/
		pageSizeMultiplier: null,

		/**
		* It is helpful for performance if the [DataList]{@link enyo.DataList} doesn't need to
		* guess the size of the children. In cases where all children are a fixed height (or
		* width, depending on the [orientation]{@link enyo.DataList#orientation} of the list),
		* you may explicitly define the size of the fixed dimension and thus allow the list to
		* bypass much of its guesswork. This value is a number that will be interpreted in
		* pixels and applied to the primary size depending on the list's `orientation` (i.e.,
		* it will be applied to `height` when the `orientation` is `'vertical'`, and to `width`
		* when the `orientation` is `'horizontal'`). Note that the list does not apply this
		* value to the children via CSS.
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
		* Because some systems perform poorly on initialization, there is a delay when we
		* attempt to actually draw the contents of a [DataList]{@link enyo.DataList}. Usually,
		* you will not need to adjust this value, which is expressed in milliseconds. If
		* `renderDelay` is `null`, there will be no delay and rendering will take place
		* synchronously; if `renderDelay` is set to `0`, rendering will be done
		* asynchronously.
		*
		* @type {Number}
		* @default 250
		* @public
		*/
		renderDelay: 250,

		/**
		* Percentage (as a number between 0 and 1) of a control that must be visible to be counted
		* by {@link enyo.DataList#getVisibleControls}.
		*
		* @type {Number}
		* @default 0.6
		* @public
		*/
		visibleThreshold: 0.6,

		/**
		* This is an inclusive list of all methods that can be queued,
		* and the prefered order they should execute, if a method is
		* not listed, it will NOT be called ever.
		*
		* @private
		*/
		_absoluteShowingPriority:['reset', 'refresh', 'finish rendering', 'scrollToIndex', 'didResize' , 'select'],

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
		* Unlike [reset()]{@link enyo.DataList#reset}, which tears down and regenerates the entire
		* [list]{@link enyo.DataList}, this method attempts to refresh the pages as they are against
		* the current dataset. This is much cheaper to call than `reset()`, but is primarily used
		* internally.
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
		* Pass in an integer within the bounds of the [list's]{@link enyo.DataList}
		* [collection]{@link enyo.DataRepeater#data} to scroll to the position of that
		* index in the list.
		*
		* @param {Number} idx - The index in the [list's]{@link enyo.DataList}
		*	[collection]{@link enyo.DataRepeater#data} to scroll to.
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
		* Returns the `start` and `end` indices of the visible controls. Partially visible controls
		* are included if the amount visible exceeds the {@link enyo.DataList#visibleThreshold}.
		*
		* This operation is *layout intesive* and should not be called during scrolling.
		*
		* @return {Object}
		* @public
		*/
		getVisibleControlRange: function () {
			return this.delegate.getVisibleControlRange(this);
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
		* Attempts to perform initialization. There are only a few basic startup paths, but it's
		* important to be aware of what they are:
		*
		* - The view is rendered, it has a collection, and the collection has data.
		* - The view is rendered, it has a collection with no data, and data is added
			later.
		* - The view is rendered, but has no collection.
		*
		* Once the [list]{@link enyo.DataList} itself is rendered, we check to see if we have a
		* [collection]{@link enyo.Collection}; if so, do we have any data to start rendering the
		* rest of the list? Ultimately, the implementation decisions are decided by the
		* [delegate]{@glossary delegate} strategy.
		*
		* @private
		*/
		rendered: function () {
			// Initialize / sync the internal absoluteShowing property when we're rendered
			this.absoluteShowing = this.getAbsoluteShowing(true);
			// actually rendering a datalist can be taxing for some systems so
			// we arbitrarily delay showing for a fixed amount of time unless delay is
			// null in which case it will be executed immediately
			var finishRendering = function () {
				if (this.get('absoluteShowing')) {
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
				} else {
					this._addToShowingQueue('finish rendering', finishRendering);
				}
			};
			if (this.renderDelay === null) {
				finishRendering.call(this);
			} else {
				this.startJob('finish rendering', finishRendering, this.renderDelay);
				// this delay will allow slower systems to keep going and get everything else
				// on screen before worrying about setting up the list
			}
		},

		/**
		* @private
		*/
		_absoluteShowingChanged: function () {
			if (this.get('absoluteShowing') && this._showingQueueMethods) {
				var methods = this._showingQueueMethods;
				var fn;
				this._showingQueueMethods = null;

				for (var i = 0; i < this._absoluteShowingPriority.length; i++) {
					fn = methods[this._absoluteShowingPriority[i]];
					if(fn) fn.call(this);
				}
			}
		},

		/**
		* Creates a deferred Que of methods to run.
		* Methods must be prioritized in [_absoluteShowingPriority]{@link enyo.DataList#_absoluteShowingPriority}
		* @private
		*/
		_addToShowingQueue: function (name, fn) {
			var methods = this._showingQueueMethods || (this._showingQueueMethods = {});
			methods[name] = fn;
		},

		/**
		* This [function]{@glossary Function} is intentionally left blank. In
		* [DataRepeater]{@link enyo.DataRepeater}, it removes the [control]{@link enyo.Control}
		* at the specified index, but that is handled by the [delegate]{@glossary delegate} here.
		*
		* @private
		*/
		remove: function (idx) {},

		/**
		* Async wrapped to work with dynamic paging, when delegate que renders sup _select will then
		* be executed.
		*
		* @private
		*/
		_select: enyo.inherit(function (sup) {
			return function (idx, model, select) {

				if (this.$.scroller.canGenerate) {
					if (this.get('absoluteShowing')) {
						sup.apply(this, arguments);
					} else {
						this._addToShowingQueue('select', function () {
							sup.apply(this, [idx, model, select]);
						});
					}
				} else {
					sup.apply(this, arguments);
				}
			};
		}),

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
					this._addToShowingQueue('refresh', this.refresh);
				}
			}
		},
		/**
		* Overloaded to call a method of the [delegate]{@glossary delegate} strategy.
		*
		* @private
		*/
		modelsRemoved: function (c, e, props) {
			if (c === this.collection && this.$.scroller.canGenerate) {
				this.deselectRemovedModels(props.models);
				if (this.get('absoluteShowing')) {
					this.delegate.modelsRemoved(this, props);
				} else {
					this._addToShowingQueue('refresh', this.refresh);
				}
			}
		},

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
		* We let the [delegate]{@glossary delegate} strategy manage the {@glossary event},
		* but we arbitrarily return `true` because we don't want the event to propagate
		* beyond this [kind]{@glossary kind}.
		*
		* @private
		*/
		didScroll: function (sender, e) {
			if (this.hasRendered && this.collection && this.collection.length > 0) {
				if (this.heightNeedsUpdate || this.widthNeedsUpdate) {
					// assign this here so that if for any reason it needs to
					// it can reset it
					this.heightNeedsUpdate = this.widthNeedsUpdate = false;
					this.refresh();
				}
				this.delegate.didScroll(this, e);
			}
			return true;
		},
		/**
		* Special override to handle resizing in an attempt to minimize the amount of work
		* we're doing. We don't want to [waterfall]{@link enyo.Component#waterfall} the
		* {@glossary event} to all children, so we hijack the normal handler.
		*
		* @private
		*/
		didResize: function (sender, e) {
			if (this.get('absoluteShowing')) {
				if (this.hasRendered && this.collection) {
					if (this.heightNeedsUpdate || this.widthNeedsUpdate) {
						// assign this here so that if for any reason it needs to
						// it can reset it
						this.heightNeedsUpdate = this.widthNeedsUpdate = false;
						this.refresh();
					}
					this.delegate.didResize(this, e);
				}
			} else {
				this._addToShowingQueue('didResize', this.didResize);
			}
		},

		/**
		* @private
		*/
		showingChangedHandler: enyo.inherit(function (sup) {
			return function (sender, e) {
				this.set('absoluteShowing', this.getAbsoluteShowing(true));

				return sup.apply(this, arguments);
			};
		}),
		/**
		* Overload to adjust the root method to be able to find the nested child based on the
		* requested index if its page is currently active. Returns `undefined` if the index is out
		* of bounds or if the [control]{@link enyo.Control} is not currently available.
		*
		* Also see [getChildForIndex()]{@link enyo.Repeater#getChildForIndex}, which calls this
		* method.
		*
		* @private
		*/
		childForIndex: function (i) {
			if (this.generated) {
				return this.delegate.childForIndex(this, i);
			}
		},

		/**
		* @private
		*/
		allowTransitionsChanged: function () {
			this.addRemoveClass('transitions', this.allowTransitions);
		},
		/**
		* {@link enyo.DataList} uses an overloaded container from its base
		* [kind]{@glossary kind}. We set the container to a [scroller]{@link enyo.Scroller}
		* and provide a way to modify the scroller options (via the
		*[scrollerOptions]{@link enyo.DataList#scrollerOptions} [hash]{@link enyo.Object}).
		* All children will reside in one of the two pages owned by the scroller.
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
		* All of the CSS is relative to this class.
		*
		* @private
		*/
		classes: 'enyo-data-list',

		/**
		* Our initial `controlParent` is us for the flyweight child.
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
		* We have to trap the Enyo-generated [onScroll]{@link enyo.Scroller#onScroll}
		* {@glossary event} and let the [delegate]{@glossary delegate} handle it. We also
		* need to catch the `onresize` events so we know when to update our cached sizing.
		* We overload the default handler so that we don't
		* [waterfall]{@link enyo.Component#waterfall} the resizing; we arbitrarily handle it
		* to minimize the amount of work we do.
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
		* Adds the [EventEmitter]{@link enyo.EventEmitter} [mixin]{@glossary mixin}
		* for the [paging]{@link enyo.DataList#paging} {@glossary event}.
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
		* An [array]{@glossary Array} of the actual page references for easier access.
		*
		* @private
		*/
		pages: null
	});

	/**
	* All subclasses of {@link enyo.DataList} will have their own static
	* [delegates]{@glossary delegate} [hash]{@glossary Object}. This is
	* per-[kind]{@glossary kind}, not per-instance.
	*
	* @private
	*/
	enyo.DataList.subclass = function (ctor) {
		ctor.delegates = enyo.clone(ctor.prototype.base.delegates || this.delegates);
	};

})(enyo, this);
