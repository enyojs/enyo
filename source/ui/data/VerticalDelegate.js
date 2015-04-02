(function (enyo, scope) {
	/**
	* This is a [delegate]{@glossary delegate} (strategy) used by {@link enyo.DataList}
	* for vertically-oriented lists. This is used by all lists for this strategy; it
	* does not get copied, but is called directly from the list.
	*
	* @name enyo.DataList.delegates.vertical
	* @type Object
	* @private
	*/
	enyo.DataList.delegates.vertical = {

		/**
		* Used to determine the minimum size of the page. The page size will be at least this
		* number of times greater than the viewport size.
		*
		* @type {Number}
		* @default 2
		* @public
		*/
		pageSizeMultiplier: 2,

		/**
		* Sets the priority properties for this orientation, which can then be customized by
		* other [delegates]{@glossary delegate} that wish to share basic functionality.
		*
		* @param {enyo.DataList} list - The [list]{@link enyo.DataList} to perform this action on.
		* @private
		*/
		initList: function (list) {
			list.posProp   = 'top';
			list.upperProp = 'top';
			list.lowerProp = 'bottom';
			list.psizeProp = 'height';
			list.ssizeProp = 'width';
			// set the scroller options
			var so         = list.scrollerOptions? (list.scrollerOptions = enyo.clone(list.scrollerOptions)): (list.scrollerOptions = {});
			// this is a datalist...it has to be scroll or auto for vertical
			so.vertical    = so.vertical == 'scroll'? 'scroll': 'auto';
			so.horizontal  = so.horizontal || 'hidden';
			// determine if the _controlsPerPage_ property has been set on the list
			if (list.controlsPerPage !== null && !isNaN(list.controlsPerPage)) {
				list._staticControlsPerPage = true;
			}
		},

		/**
		* @private
		*/
		generate: function (list) {
			for (var i=0, p; (p=list.pages[i]); ++i) {
				this.generatePage(list, p, p.index);
			}
			this.adjustPagePositions(list);
			this.adjustBuffer(list);
		},


		/**
		* Performs a hard reset of the [list's]{@link enyo.DataList} pages and children.
		* Scrolls to the top and resets each page's children to have the correct indices.
		*
		* @param {enyo.DataList} list - The [list]{@link enyo.DataList} to perform this action on.
		* @private
		*/
		reset: function (list) {
			list.$.page1.index = 0;
			list.$.page2.index = 1;
			this.generate(list);
			list.hasReset = true;
			// reset the scroller so it will also start from the 'top' whatever that may
			// be (left/top)
			this.scrollTo(list, 0, 0);
		},

		/**
		* Retrieves [list]{@link enyo.DataList} pages, indexed by their position.
		*
		* @param {enyo.DataList} list - The [list]{@link enyo.DataList} to perform this action on.
		* @returns {Object} Returns a [hash]{@glossary Object} of the pages marked by their
		*	position as either 'firstPage' or 'lastPage'.
		* @private
		*/
		pagesByPosition: function (list) {
			var metrics     = list.metrics.pages,
				pos         = list.pagePositions || (list.pagePositions={}),
				upperProp   = list.upperProp,
				firstIndex  = list.$.page1.index || 0,
				secondIndex = (list.$.page2.index || list.$.page2.index === 0) ? list.$.page2.index : 1;
			pos.firstPage   = (
				metrics[firstIndex] && metrics[secondIndex] &&
				(metrics[secondIndex][upperProp] < metrics[firstIndex][upperProp])
				? list.$.page2
				: list.$.page1
			);
			pos.lastPage = (pos.firstPage === list.$.page1? list.$.page2: list.$.page1);
			return pos;
		},

		/**
		* Refreshes each page in the given [list]{@link enyo.DataList}, adjusting its position
		* and adjusting the buffer accordingly.
		*
		* @param {enyo.DataList} list - The [list]{@link enyo.DataList} to perform this action on.
		* @private
		*/
		refresh: function (list) {
			if (!list.hasReset) { return this.reset(list); }
			this.assignPageIndices(list);
			this.generate(list);
		},

		/**
		* Once the [list]{@link enyo.DataList} is initially rendered, it will generate its
		* [scroller]{@link enyo.Scroller} (so we know that is available). Now we need to
		* cache our initial size values and apply them to our pages individually.
		*
		* @param {enyo.DataList} list - The [list]{@link enyo.DataList} to perform this action on.
		* @private
		*/
		rendered: function (list) {
			if (list.$.scroller.addScrollListener) {
				list.usingScrollListener = true;
				list.$.scroller.addScrollListener(
					enyo.bindSafely(this, 'scrollHandler', list)
				);
			}
			// get our initial sizing cached now since we should actually have
			// bounds at this point
			this.updateBounds(list);
			// calc offset of pages to scroller client
			this.calcScrollOffset(list);
			// now if we already have a length then that implies we have a controller
			// and that we have data to render at this point, otherwise we don't
			// want to do any more initialization
			if (list.collection && list.collection.length) { this.reset(list); }
		},
		/**
		* Generates the markup for the page content.
		*
		* @private
		*/
		generatePage: function (list, page, index) {
			// Temporarily add logging code to make it easier for
			// QA and others to detect and report page-index issues
			if (index < 0) {
				enyo.warn('Invalid page index: ' + index);
			}
			// in case it hasn't been set we ensure it is marked correctly
			page.index  = index;
				// the collection of data with records to use
			var data    = list.collection,
				// the metrics for the entire list
				metrics = list.metrics,
				// controls per page
				perPage = this.controlsPerPage(list),
				// placeholder for the control we're going to update
				view;

			// the first index for this generated page
			page.start  = perPage * index;
			// the last index for this generated page
			page.end    = Math.min((data.length - 1), (page.start + perPage) - 1);

			// if generating a control we need to use the correct page as the control parent
			list.controlParent = page;
			for (var i=page.start; i <= page.end && i < data.length; ++i) {
				view = (page.children[i - page.start] || list.createComponent({}));
				// disable notifications until all properties to be updated
				// have been
				view.teardownRender();
				view.stopNotifications();
				view.set('model', data.at(i));
				view.set('index', i);
				this.checkSelected(list, view);
				view.set('selected', list.isSelected(view.model));
				view.startNotifications();
				view.canGenerate = true;
			}
			// if there are any controls that need to be hidden we do that now
			for (i=(i-page.start); i < page.children.length; ++i) {
				view = page.children[i];
				view.teardownRender();
				view.canGenerate = false;
			}
			// update the entire page at once - this removes old nodes and updates
			// to the correct ones
			page.render();
			// now to update the metrics
			metrics        = metrics.pages[index] || (metrics.pages[index] = {});
			metrics.height = this.pageHeight(list, page);
			metrics.width  = this.pageWidth(list, page);
			// update the childSize value now that we have measurements
			this.childSize(list);
		},

		/**
		* checks whether the control should have selected set based on selectionProperty
		*
		* @private
		*/
		checkSelected: function (list, view) {
			var s = list.selectionProperty;
			if (s && view.model.get(s) && !list.isSelected(view.model)) {
				list.select(view.index);
				// don't have to check opposite case (model is false and isSelected is true)
				// because that shouldn't happen
			}
		},

		/**
		* Generates a child size for the given [list]{@link enyo.DataList}.
		*
		* @private
		*/
		childSize: function (list) {
			if (!list.fixedChildSize) {
				var pageIndex = list.$.page1.index,
					sizeProp  = list.psizeProp,
					n         = list.$.page1.node || list.$.page1.hasNode(),
					size, props;
				if (pageIndex >= 0 && n) {
					props = list.metrics.pages[pageIndex];
					size  = props? props[sizeProp]: 0;
					list.childSize = Math.floor(size / (n.children.length || 1));
				}
			}
			return list.fixedChildSize || list.childSize || (list.childSize = 100); // we have to start somewhere
		},

		/**
		* Calculates the number of controls required to fill a page. This functionality is broken
		* out of [controlsPerPage]{@link DataList.delegates.vertical#controlsPerPage} so that it
		* can be overridden by delegates that inherit from this one.
		*
		* @private
		*/
		calculateControlsPerPage: function (list) {
			var fn              = this[list.psizeProp],
				multi           = list.pageSizeMultiplier || this.pageSizeMultiplier,
				childSize       = this.childSize(list);

			// using height/width of the available viewport times our multiplier value
			return Math.ceil(((fn.call(this, list) * multi) / childSize) + 1);
		},

		/**
		* When necessary, updates the the value of `controlsPerPage` dynamically to ensure that
		* the page size is always larger than the viewport size. Note that once a
		* [control]{@link enyo.Control} is instanced (if this number increases and then decreases),
		* the number of available controls will be used instead. This method updates the
		* [childSize]{@link enyo.DataList#childSize} and is used internally to calculate other
		* values, such as [defaultPageSize]{@link DataList.delegates.vertical#defaultPageSize}.
		*
		* @private
		*/
		controlsPerPage: function (list, forceUpdate) {
			if (list._staticControlsPerPage) {
				return list.controlsPerPage;
			} else {
				var updatedControls = list._updatedControlsPerPage,
					updatedBounds   = list._updatedBounds,
					perPage         = list.controlsPerPage;
				// if we've never updated the value or it was done longer ago than the most
				// recent updated sizing/bounds we need to update
				if (forceUpdate || !updatedControls || (updatedControls < updatedBounds)) {
					perPage = list.controlsPerPage = this.calculateControlsPerPage(list);
					// update our time for future comparison
					list._updatedControlsPerPage = enyo.perfNow();
				}
				return perPage;
			}
		},

		/**
		* Retrieves the page index for the given record index.
		*
		* @private
		*/
		pageForIndex: function (list, i) {
			var perPage = list.controlsPerPage || this.controlsPerPage(list);
			return Math.floor(i / (perPage || 1));
		},

		/**
		* An indirect interface to the list's scroller's scrollToControl()
		* method. We provide this to create looser coupling between the
		* delegate and the list / scroller, and to enable subkinds of the
		* delegate to easily override scrollToControl() functionality to
		* include options specific to the scroller being used.
		*
		* @private
		*/
		scrollToControl: function (list, control) {
			list.$.scroller.scrollToControl(control);
		},

		/**
		* An indirect interface to the list's scroller's scrollTo()
		* method. We provide this to create looser coupling between the
		* delegate and the list / scroller, and to enable subkinds of the
		* delegate to easily override scrollTo() functionality to
		* include options specific to the scroller being used.
		*
		* @private
		*/
		scrollTo: function (list, x, y) {
			list.$.scroller.scrollTo(x, y);
		},

		/**
		* Attempts to scroll to the given index.
		*
		* @param {enyo.DataList} list - The [list]{@link enyo.DataList} to perform this action on.
		* @param {Number} i - The index to scroll to.
		* @private
		*/
		scrollToIndex: function (list, i) {
				// first see if the child is already available to scroll to
			var c = this.childForIndex(list, i),
				// but we also need the page so we can find its position
				p = this.pageForIndex(list, i);
			// if there is no page then the index is bad
			if (p < 0 || p > this.pageCount(list)) { return; }
			// if there isn't one, then we know we need to go ahead and
			// update, otherwise we should be able to use the scroller's
			// own methods to find it
			list.$.scroller.stop();
			if (c) {
				this.scrollToControl(list, c);
			} else {
				// we do this to ensure we trigger the paging event when necessary
				this.resetToPosition(list, this.pagePosition(list, p));
				// now retry the original logic until we have this right
				list.startJob('vertical_delegate_scrollToIndex', function () {
					list.scrollToIndex(i);
				});
			}
		},

		/**
		* Returns the calculated height for the given page.
		*
		* @private
		*/
		pageHeight: function (list, page) {
			var h = page.node.offsetHeight;
			var m = list.metrics.pages[page.index];
			var len = list.collection? list.collection.length: 0;
			if (h === 0 && len && page.node.children.length) {
				list.heightNeedsUpdate = true;
				// attempt to reuse the last known height for this page
				h = m? m.height: 0;
			}
			return h;
		},

		/**
		* Returns the calculated width for the given page.
		*
		* @private
		*/
		pageWidth: function (list, page) {
			var w = page.node.offsetWidth;
			var m = list.metrics.pages[page.index];
			var len = list.collection? list.collection.length: 0;
			if (w === 0 && len && page.node.children.length) {
				list.widthNeedsUpdate = true;
				// attempt to reuse the last known width for this page
				w = m? m.width: 0;
			}
			return w;
		},

		/**
		* Attempts to intelligently decide when to force updates for [models]{@link enyo.Model}
		* being added, if the models are part of any visible pages. For now, an assumption is
		* made that records being added are ordered and sequential.
		*
		* @private
		*/
		modelsAdded: function (list, props) {

			// if the list has not already reset, reset
			if (!list.hasReset) return this.reset(list);

			var cpp = this.controlsPerPage(list),
				end = Math.max(list.$.page1.start, list.$.page2.start) + cpp;

			// note that this will refresh the following scenarios
			// 1. if the dataset was spliced in above the current indices and the last index added was
			//    less than the first index rendered
			// 2. if the dataset was spliced in above the current indices and overlapped some of the
			//    current indices
			// 3. if the dataset was spliced in above the current indices and completely overlapped
			//    the current indices (pushing them all down)
			// 4. if the dataset was spliced inside the current indices (pushing some down)
			// 5. if the dataset was appended to the current dataset and was inside the indices that
			//    should be currently rendered (there was a partially filled page)

			// the only time we don't refresh is if the first index of the contiguous set of added
			// models is beyond our final rendered page (possible) indices

			// in the case where it does not need to refresh the existing controls except the last page
			// if the last page is not fully filled, it will be filled with added models
			// so we should generate the last page.

			// it will update its measurements and page positions within the buffer
			// so scrolling can continue properly

			// if we need to refresh, do it now and ensure that we're properly setup to scroll
			// if we were adding to a partially filled page
			if (props.index <= end ) this.refresh(list);
			else {
				// we should confirm that the page which new models are added is need to update list.metrics
				var lastPageIndex = this.pageForIndex(list, props.index),
					// the last page before model added
					lastPage = list.metrics.pages[lastPageIndex],
					sp = list.psizeProp,
					// current page count after models added
					pc = this.pageCount(list),
					pageSize;

				// if there is more pages after lastPage, the lastPage metric needs to be updated
				if (lastPageIndex < pc) {
					pageSize = this.defaultPageSize(list);
					if (lastPage[sp] < pageSize) {
						lastPage[sp] = pageSize;
					}
				}

				// we still need to ensure that the metrics are updated so it knows it can scroll
				// past the boundaries of the current pages (potentially)
				this.adjustBuffer(list);
				this.adjustPagePositions(list);
			}
		},

		/**
		* Attempts to find the [control]{@link enyo.Control} for the requested index.
		*
		* @private
		*/
		childForIndex: function (list, i) {
			var p  = this.pageForIndex(list, i),
				p1 = list.$.page1,
				p2 = list.$.page2;
			p = (p==p1.index && p1) || (p==p2.index && p2);
			if (p) {
				for (var j=0, c; (c=p.children[j]); ++j) {
					if (c.index == i) {
						return c;
					}
				}
			}
		},

		/**
		* Attempts to intelligently decide when to force updates for [models]{@link enyo.Model}
		* being removed, if the models are part of any visible pages.
		*
		* @private
		*/
		modelsRemoved: function (list, props) {

			// if the list has not already reset, reset
			if (!list.hasReset) return this.reset(list);

			var pg1 = list.$.page1,
				pg2 = list.$.page2,
				lastIdx = Math.max(pg1.end, pg2.end);

			// props.models is removed modelList and the lowest index among removed models
			if (props.models.low <= lastIdx) {
				this.refresh(list);
			}
		},

		/**
		* Recalculates the buffer size based on the current metrics for the given list. This
		* may not be completely accurate until the final page is scrolled into view.
		*
		* @private
		*/
		adjustBuffer: function (list) {
			var pc = this.pageCount(list),
				ds = this.defaultPageSize(list),
				bs = 0, sp = list.psizeProp, ss = list.ssizeProp,
				n = list.$.buffer.node || list.$.buffer.hasNode(), p;
			if (n) {
				if (pc !== 0) {
					for (var i=0; i<pc; ++i) {
						p = list.metrics.pages[i];
						bs += (p && p[sp]) || ds;
					}
				}
				list.bufferSize = bs;
				n.style[sp] = bs + 'px';
				n.style[ss] = this[ss](list) + 'px';
				list.$.scroller.remeasure();
			}
		},

		/**
		* Ensures that the pages are positioned according to their calculated positions,
		* updating if necessary.
		*
		* @private
		*/
		adjustPagePositions: function (list) {
			for (var i=0, p; (p=list.pages[i]); ++i) {
				var pi = p.index,
					cp = this.pagePosition(list, p.index),
					mx = list.metrics.pages[pi] || (list.metrics.pages[pi] = {}),
					pp = list.posProp,
					up = list.upperProp,
					lp = list.lowerProp,
					sp = list.psizeProp;
				p.node.style[pp] = cp + 'px';
				p[up] = mx[up] = cp;
				p[lp] = mx[lp] = (mx[sp] + cp);
			}
			this.setScrollThreshold(list);
		},

		/**
		* Retrieves the assumed position for the requested page index.
		*
		* @private
		*/
		pagePosition: function (list, index) {
			var mx = list.metrics.pages,
				ds = this.defaultPageSize(list),
				tt = 0, sp = list.psizeProp, cp;
			while (index > 0) {
				cp = mx[--index];
				// if the index is > 0 then we need to ensure we have at least
				// the minimum height available so this is a deliberate 'fail-on-zero' case
				tt += (cp && cp[sp]? cp[sp]: ds);
			}
			return tt;
		},

		/**
		* Retrieves the default page size.
		*
		* @private
		*/
		defaultPageSize: function (list) {
			var perPage = list.controlsPerPage || this.controlsPerPage(list);
			return (perPage * (list.fixedChildSize || list.childSize || 100));
		},

		/**
		* Retrieves the number of pages for the given [list]{@link enyo.DataList}.
		*
		* @private
		*/
		pageCount: function (list) {
			var perPage = list.controlsPerPage || this.controlsPerPage(list);
			var len = list.collection? list.collection.length: 0;
			return (Math.ceil(len / (perPage || 1)));
		},

		/**
		* Retrieves the current (and desired) scroll position from the
		* [scroller]{@link enyo.Scroller} for the given list.
		*
		* @private
		*/
		getScrollPosition: function (list) {
			return list.$.scroller.getScrollTop();
		},

		/**
		* Sets the scroll position on the [scroller]{@link enyo.Scroller}
		* owned by the given list.
		*
		* @private
		*/
		setScrollPosition: function (list, pos) {
			list.$.scroller.setScrollTop(pos);
		},

		/**
		* @private
		*/
		scrollHandler: function (list, bounds) {
			var last = this.pageCount(list)-1,
				pos  = this.pagesByPosition(list);
			if ((bounds.xDir === 1 || bounds.yDir === 1) && pos.lastPage.index !== (last)) {
				this.generatePage(list, pos.firstPage, pos.lastPage.index + 1);
				this.adjustPagePositions(list);
				this.adjustBuffer(list);
				// note that the reference to the page positions has been udpated by
				// another method so we trust the actual pages
				list.triggerEvent('paging', {
					start: pos.firstPage.start,
					end: pos.lastPage.end,
					action: 'scroll'
				});
			} else if ((bounds.xDir === -1 || bounds.yDir === -1) && pos.firstPage.index !== 0) {
				this.generatePage(list, pos.lastPage, pos.firstPage.index - 1);
				this.adjustPagePositions(list);
				this.adjustBuffer(list);
				// note that the reference to the page positions has been udpated by
				// another method so we trust the actual pages
				list.triggerEvent('paging', {
					start: pos.firstPage.start,
					end: pos.lastPage.end,
					action: 'scroll'
				});
			}
		},

		/**
		* @private
		*/
		setScrollThreshold: function (list) {
			var threshold = list.scrollThreshold || (list.scrollThreshold={}),
				metrics   = list.metrics.pages,
				pos       = this.pagesByPosition(list),
				firstIdx  = pos.firstPage.index,
				lastIdx   = pos.lastPage.index,
				count     = this.pageCount(list)-1,
				lowerProp = list.lowerProp,
				upperProp = list.upperProp,
				fn        = upperProp == 'top'? this.height: this.width;
			// now to update the properties the scroller will use to determine
			// when we need to be notified of position changes requiring paging
			if (firstIdx === 0) {
				threshold[upperProp] = undefined;
			} else {
				threshold[upperProp] = (metrics[firstIdx][upperProp] + this.childSize(list));
			}
			if (lastIdx >= count) {
				threshold[lowerProp] = undefined;
			} else {
				threshold[lowerProp] = (metrics[lastIdx][lowerProp] - fn.call(this, list) - this.childSize(list));
			}
			if (list.usingScrollListener) {
				list.$.scroller.setScrollThreshold(threshold);
			}
		},

		/**
		* Determines which two pages to generate, based on a
		* specific target scroll position.
		*
		* @private
		*/
		assignPageIndices: function (list, targetPos) {
			var index1, index2, bias,
				pc = this.pageCount(list),
				last = Math.max(0, pc - 1),
				currentPos = this.getScrollPosition(list);

			// If no target position was specified, use the current position
			if (typeof targetPos == 'undefined') {
				targetPos = currentPos;
			}

			// Make sure the target position is in-bounds
			targetPos = Math.max(0, Math.min(targetPos, list.bufferSize));

			// First, we find the target page (the one that covers the target position)
			index1 = Math.floor(targetPos / this.defaultPageSize(list));
			index1 = Math.min(index1, last);

			// Our list always generates two pages worth of content, so -- now that we have
			// our target page -- we need to pick either the preceding page or the following
			// page to generate as well. To help us decide, we first determine how our
			// target position relates to our current position. If we know which direction
			// we're moving in, it's generally better to render the page that lies between
			// our current position and our target position, in case we are about to scroll
			// "lazily" to an element near the edge of our target page. If we don't have any
			// information to work with, we arbitrarily favor the following page.
			bias = (targetPos > currentPos) ? -1 : 1;

			// Now we know everything we need to choose our second page...
			index2 =
				// If our target page is the first page (index == 0), there is no preceding
				// page -- so we choose the following page (index == 1). Note that our
				// our target page will always be (index == 0) if the list is empty or has
				// only one page worth of content. Picking (index == 1) for our second page
				// in these cases is fine, though the page won't contain any elements.
				(index1 === 0) ? 1 :
				// If target page is the last page, there is no following page -- so we choose
				// the preceding page.
				(index1 === last) ? index1 - 1 :
				// In all other cases, we pick a page using our previously determined bias.
				index1 + bias;

			list.$.page1.index = index1;
			list.$.page2.index = index2;
		},

		/**
		* @private
		*/
		resetToPosition: function (list, px) {
			this.assignPageIndices(list, px);
			this.generate(list);
			list.triggerEvent('paging', {
				start: list.$.page1.start,
				end: list.$.page2.end,
				action: 'reset'
			});
		},
		/**
		* Handles scroll [events]{@glossary event} for the given [list]{@link enyo.DataList}.
		* The events themselves aren't helpful, as, depending on the underlying
		* `scrollStrategy`, they have varied information. This is a hefty method, but it is
		* contained to keep from calling too many [functions]{@glossary Function} whenever
		* this event is propagated.
		*
		* @private
		*/
		didScroll: function (list, event) {
			if (!list.usingScrollListener) {
				var threshold = list.scrollThreshold,
					bounds    = event.scrollBounds,
					ds        = this.defaultPageSize(list),
					lowerProp = list.lowerProp,
					upperProp = list.upperProp,
					pos       = bounds[upperProp],
					ut        = threshold[upperProp],
					lt        = threshold[lowerProp];
				if (bounds.xDir === 1 || bounds.yDir === 1) {
					if (!isNaN(lt)) {
						if (pos >= lt) {
							if (pos >= lt + ds) {
								// big jump
								this.resetToPosition(list, pos);
							} else {
								// continuous scrolling
								this.scrollHandler(list, bounds);
							}
						}
					}
				} else if (bounds.yDir === -1 || bounds.xDir === -1) {
					if (!isNaN(ut) && (pos <= ut)) {
						if (pos <= ut) {
							if (pos <= ut - ds) {
								// big jump
								this.resetToPosition(list, pos);
							} else {
								//continuous scrolling
								this.scrollHandler(list, bounds);
							}
						}
					}
				}
			}
		},

		/**
		* The delegate's `resize` event handler.
		*
		* @private
		*/
		didResize: function (list) {
			var prevCPP = list.controlsPerPage;

			list._updateBounds = true;
			this.updateBounds(list);
			// Need to update our controlsPerPage value immediately,
			// before any cached metrics are used
			this.controlsPerPage(list);
			if (prevCPP !== list.controlsPerPage) {
				// since we are now using a different number of controls per page,
				// we need to invalidate our cached page metrics
				list.metrics.pages = {};
			}
			this.resetToPosition(list);
		},

		/**
		* Returns the height for the given [list]{@link enyo.DataList}. This value
		* is cached and reused until the list is resized.
		*
		* @private
		*/
		height: function (list) {
			if (list._updateBounds) { this.updateBounds(list); }
			return list.boundsCache.height;
		},

		/**
		* Returns the width for the given [list]{@link enyo.DataList}. This value
		* is cached and reused until the list is resized.
		*
		* @private
		*/
		width: function (list) {
			if (list._updateBounds) { this.updateBounds(list); }
			return list.boundsCache.width;
		},

		/**
		* Updates the cached values for the sizing of the given list.
		*
		* @private
		*/
		updateBounds: function (list) {
			list.boundsCache    = list.getBounds();
			list._updatedBounds = enyo.perfNow();
			list._updateBounds  = false;
		},

		/**
		* Returns the `start` and `end` indices of the visible controls. Partially visible controls
		* are included if the amount visible exceeds the {@link enyo.DataList#visibleThreshold}.
		*
		* @private
		*/
		getVisibleControlRange: function (list) {
			var ret = {
					start: -1,
					end: -1
				},
				posProp = list.posProp,
				sizeProp = list.psizeProp,
				size = this[sizeProp](list),
				scrollPosition = this.getScrollPosition(list),
				pages = list.pages.slice(0).sort(function (a, b) {
					return a.start - b.start;
				}),
				i = 0,
				max = list.collection? list.collection.length - 1 : 0,
				cpp = list.controlsPerPage,
				adjustedScrollPosition, p, bounds, ratio;

			// find the first showing page and estimate the start and end indices
			while ((p = pages[i++])) {
				bounds = p.getBounds();
				bounds.right = list.bufferSize - bounds.left - bounds.width;

				adjustedScrollPosition = scrollPosition - list.scrollPositionOffset;

				if (scrollPosition >= bounds[posProp] && scrollPosition < bounds[posProp] + bounds[sizeProp]) {
					ratio = cpp/bounds[sizeProp];
					ret.start = Math.min(max, Math.max(0, Math.round((adjustedScrollPosition - bounds[posProp])*ratio) + p.start));
					ret.end = Math.min(max, Math.round(size*ratio) + ret.start);
					break;
				}
			}

			ret.start = this.adjustIndex(list, ret.start, p, bounds, adjustedScrollPosition, true);
			ret.end = Math.max(ret.start, this.adjustIndex(list, ret.end, p, bounds, adjustedScrollPosition + size, false));

			return ret;
		},

		/**
		* Calculates the scroll position offset to account for the dimensions of any controls that
		* are within the scroller but precede the pages.
		*
		* @param  {enyo.DataList} list            The instance of enyo.DataList
		* @private
		*/
		calcScrollOffset: function (list) {
			var wrapper = list.pages[0].parent.hasNode(),
				scroller = list.$.scroller.hasNode(),
				posProp = list.posProp,
				position;

			// these should always be truthy in production scenarios but since the nodes aren't
			// actually rendered in mocha, the tests fail so guarding against that.
			if (wrapper && scroller) {
				position = enyo.dom.calcNodePosition(wrapper, scroller);
				list.scrollPositionOffset = position[posProp];
			} else {
				list.scrollPositionOffset = 0;
			}
		},

		/**
		* Refines an estimated `index` to a precise index by evaluating the bounds of the control at
		* the estimated `index` against the visible area and adjusting it up or down based on the
		* actual bounds and the `list`'s {@link enyo.DataList#visibleThreshold}.
		*
		* @param {enyo.DataList} list
		* @param {Number}        index           Estimated index
		* @param {enyo.Control}  page            Page control containing control at `index`
		* @param {Object}        pageBounds      Bounds of `page`
		* @param {Number}        scrollBoundary  Edge of visible area (top, bottom, left, or right)
		* @param {Boolean}       start           `true` for start of boundary (top, right), `false`
		*   for end
		* @private
		*/
		adjustIndex: function (list, index, page, pageBounds, scrollBoundary, start) {
			var dir = start? -1 : 1,
				posProp = list.posProp,
				sizeProp  = list.psizeProp,
				max = list.collection? list.collection.length - 1 : 0,
				last, control, bounds,

				// edge of control
				edge,

				// distance from edge of control to scroll boundary
				dEdge,

				// distance from visible threshold to scroll boundary
				dThresh;

			do {
				control = list.getChildForIndex(index);

				// if index is on a boundary (other than 0) and the control is fully visible, the
				// control at index may not exist if the buffer page hasn't shifted to cover this
				// index range yet. If that's the case, revert to our previous index and stop.
				if (!control) {
					index = last;
					break;
				}

				// account for crossing page boundaries
				if (control.parent != page) {
					page = control.parent;
					pageBounds = page.getBounds();
				}

				bounds = control.getBounds();
				bounds.right = pageBounds.width - bounds.left - bounds.width;

				edge = bounds[posProp] + pageBounds[posProp] + (start? 0 : bounds[sizeProp]);
				dEdge = edge - scrollBoundary;
				dThresh = dEdge - dir*bounds[sizeProp]*(1-list.visibleThreshold)	;

				if ((start && dEdge > 0) || (!start && dEdge < 0)) {
					// control is fully visible
					if (last !== index + dir) {
						last = index;
						index += dir;
					} else {
						// if this control is fully visible but the last was too obscured, use this
						break;
					}
				} else if ((start && dThresh >= 0) || (!start && dThresh <= 0)) {
					// control is partially obscured but enough is visible
					break;
				} else {
					// control is too obscured
					if (last !== index - dir) {
						last = index;
						index -= dir;
					} else {
						// use the last since this is too obscured
						index = last;
						break;
					}
				}

				// guard against selecting an index that is out of bounds
				if (index < 0) {
					index = 0;
					break;
				} else if (index > max) {
					index = max;
					break;
				}
			} while (true);

			return index;
		}
	};

})(enyo, this);
