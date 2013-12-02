//*@protected
/**
	This is a delegate (strategy) used by _enyo.DataList_ for vertically oriented
	lists. This is used by all lists for this strategy and does not get copied but
	called directly from the list.
*/
enyo.DataList.delegates.vertical = {
	/**
		Used to determine the minumum size of the pages. The page size will be at least
		this number of times greater than the viewport size.
	*/
	pageSizeMultiplier: 2,
	/**
		Simply set the priority properties for this orientation that can be differentiated
		by other delegates that wish to share some basic functionality.
	*/
	initList: function (list) {
		list.posProp   = "top";
		list.upperProp = "top";
		list.lowerProp = "bottom";
		list.psizeProp = "height";
		list.ssizeProp = "width";
		// set the scroller options
		var so         = list.scrollerOptions? (list.scrollerOptions = enyo.clone(list.scrollerOptions)): (list.scrollerOptions = {});
		// this is a datalist...it has to be scroll or auto for vertical
		so.vertical    = so.vertical == "scroll"? "scroll": "auto";
		so.horizontal  = so.horizontal || "hidden";
	},
	/**
		A hard reset of the list pages and children. Will scroll to the top, reset children
		of each page to the correct indices starting at the beginning.
	*/
	reset: function (list) {
		// go ahead and reset the page content and the pages to their original
		// positions
		for (var i=0, p; (p=list.pages[i]); ++i) {
			this.generatePage(list, p, i);
		}
		// adjust page positions
		this.adjustPagePositions(list);
		// now update the buffer
		this.adjustBuffer(list);
		list.hasReset = true;
		// reset the scroller so it will also start from the 'top' whatever that may
		// be (left/top)
		list.$.scroller.scrollTo(0, 0);
	},
	/**
		Returns a hash of the pages marked by there position as either 'firstPage' or 'lastPage'.
	*/
	pagesByPosition: function (list) {
		var metrics     = list.metrics.pages,
			pos         = list.pagePositions || (list.pagePositions={}),
			upperProp   = list.upperProp,
			firstIndex  = list.$.page1.index,
			secondIndex = list.$.page2.index;
		pos.firstPage   = (
			metrics[firstIndex][upperProp] < metrics[secondIndex][upperProp]
			? list.$.page1
			: list.$.page2			
		);
		pos.lastPage = (pos.firstPage === list.$.page1? list.$.page2: list.$.page1);
		return pos;
	},
	/**
		Refreshes each page in the given list, adjusting their positions and adjusting
		the buffer accordingly.
	*/
	refresh: function (list) {
		if (!list.hasReset) { return this.reset(list); }
		var pageCount   = Math.max(this.pageCount(list) - 1, 0),
			firstIndex  = list.$.page1.index,
			secondIndex = list.$.page2.index;
		if (firstIndex > pageCount) {
			firstIndex = pageCount;
		}
		if (secondIndex > pageCount) {
			if ((firstIndex + 1) > pageCount && (firstIndex - 1) >= 0) {
				secondIndex = firstIndex - 1;
			} else {
				secondIndex = firstIndex + 1;
			}
		}
		list.$.page1.index = firstIndex;
		list.$.page2.index = secondIndex;
		// update according to their current indices
		for (var i=0, p; (p=list.pages[i]); ++i) {
			this.generatePage(list, p, p.index);
		}
		// adjust their positions in case they've changed at all
		this.adjustPagePositions(list);
		// now update the buffer
		this.adjustBuffer(list);
	},
	/**
		Once the list is initially rendered it will generate its scroller (so
		we know that is available). Now we need to cache our initial size values
		and apply them to our pages individually.
	*/
	rendered: function (list) {
		if (list.$.scroller.addScrollListener) {
			list.usingScrollListener = true;
			list.$.scroller.addScrollListener(
				enyo.bindSafely(this, "scrollHandler", list)
			);
		}
		// get our initial sizing cached now since we should actually have
		// bounds at this point
		this.updateBounds(list);
		// now if we already have a length then that implies we have a controller
		// and that we have data to render at this point, otherwise we don't
		// want to do any more initialization
		if (list.length) { this.reset(list); }
	},
	/**
		This method generates the markup for the page content.
	*/
	generatePage: function (list, page, index) {
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
			view.set("model", data.at(i));
			view.set("index", i);
			view.set("selected", list.isSelected(view.model));
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
	},
	/**
		Generates a child size for the given list.
	*/
	childSize: function (list) {
		var pageIndex = list.$.page1.index,
			sizeProp  = list.psizeProp,
			n         = list.$.page1.node || list.$.page1.hasNode(),
			size, props;
		if (pageIndex >= 0 && n) {
			props = list.metrics.pages[pageIndex];
			size  = props? props[sizeProp]: 0;
			list.childSize = Math.floor(size / (n.children.length || 1));
		}
		return list.childSize || (list.childSize = 100); // we have to start somewhere
	},
	/**
		When necessary will update the the value of controlsPerPage dynamically
		to ensure the page size is always larger than the viewport. Note that
		once a control is instanced (if this number becomes greater and then is
		reduced) the number of available controls will be used instead. This method
		will updated the _childSize_ value as well used internally for other values
		such as _defaultPageSize_.
	*/
	controlsPerPage: function (list) {
		var updatedControls = list._updatedControlsPerPage,
			updatedBounds   = list._updatedBounds,
			childSize       = list.childSize,
			perPage         = list.controlsPerPage,
			sizeProp        = list.psizeProp,
			multi           = list.pageSizeMultiplier || this.pageSizeMultiplier,
			fn              = this[sizeProp];
		// if we've never updated the value or it was done longer ago than the most
		// recent updated sizing/bounds we need to update
		if (!updatedControls || (updatedControls < updatedBounds)) {
			// we always update the default child size value first, here
			childSize = this.childSize(list);
			// using height/width of the available viewport times our multiplier value
			perPage   = list.controlsPerPage = Math.ceil((fn(list) * multi) / childSize);
			// update our time for future comparison
			list._updatedControlsPerPage = enyo.bench();
		}
		/*jshint -W093 */
		return (list.controlsPerPage = perPage);
	},
	/**
		Retrieves the page index for the given record index.
	*/
	pageForIndex: function (list, i) {
		var perPage = list.controlsPerPage || this.controlsPerPage(list);
		return Math.floor(i / (perPage || 1));
	},
	/**
		Attempts to scroll to the given index.
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
		if (c) {
			list.$.scroller.scrollIntoView(c, this.pagePosition(list, p));
		} else {
			// we do this to ensure we trigger the paging event when necessary
			this.resetToPosition(list, this.pagePosition(list, p));
			// now retry the original logic until we have this right
			enyo.asyncMethod(function () {
				list.scrollToIndex(i);
			});
		}
	},
	/**
		Returns the calculated height for the given page.
	*/
	pageHeight: function (list, page) {
		return page.node.offsetHeight;
	},
	/**
		Returns the calculated width for the given page.
	*/
	pageWidth: function (list, page) {
		return page.node.offsetWidth;
	},
	/**
		Attempts to intelligently decide when to force updates for models being added
		if the models are part of any visible pages. For now an assumption is made that
		records being added are ordered and sequential.
	*/
	modelsAdded: function (list, props) {
		if (!list.hasReset) { return this.reset(list); }
		// the current indices that are rendered
		var fi = list.$.page1.index || (list.$.page1.index=0),
			si = list.$.page2.index || (list.$.page2.index=1), rf, rs, pi;
		for (var i=0, ri; (ri=props.records[i]) >= 0; ++i) {
			pi = this.pageForIndex(list, ri);
			// we ensure that if the page index is either page we flag that page as
			// needing to be updated
			if (pi == fi) {
				rf = true;
			} else if (pi == si) {
				rs = true;
			} else if (pi > si) {
				// no need to continue looking if the page index is greater
				// than the known second page index
				break;
			}
		}
		// if either page was flagged go ahead and update it
		if (rf) { this.generatePage(list, list.$.page1, fi); }
		if (rs) { this.generatePage(list, list.$.page2, si); }
		// if either was updated we want to go ahead and ensure that our page positions
		// are still appropriate
		if (rf || rs) { this.adjustPagePositions(list); }
		// either way we need to adjust the buffer size
		this.adjustBuffer(list);
	},
	/**
		Attempts to find the control for the requested index.
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
		Attempts to inelligently decide when to force updates for models being removed
		if the models are part of any visible pages.
	*/
	modelsRemoved: function (list, props) {
		// we know that the removed records have been ordered so we can
		// work from the bottom to the top, a major difference between adding
		// and removing, however, is the fact that added records are grouped
		// and removed models could be random so we may have to check them all
		var keys = enyo.keys(props.records),
			fi   = list.$.page1.index,
			si   = list.$.page2.index, pi;
		for (var i=keys.length-1, k; (k=keys[i]) >= 0; --i) {
			pi = this.pageForIndex(list, k);
			// if either page is included we'll break here and refresh them both
			// to ensure accurate view
			if (pi == fi || pi == si) {
				this.refresh(list);
				// for sanity we check to ensure that the current scroll position is
				// showing our available content fully since elements were removed
				var pos = this.pagesByPosition(list);
				this.scrollToIndex(list, pos.firstPage.start);
				break;
			}
		}
	},
	/**
		Recalculates the buffer size based on the current metrics for the given
		list. This may or may not be completely accurate until the final page is
		scrolled into view.
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
			n.style[sp] = bs + "px";
			n.style[ss] = this[ss](list) + "px";
		}
	},
	/**
		Will ensure that the pages are positioned according to their calculated
		positions and update if necessary.
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
			p.node.style[pp] = cp + "px";
			p[up] = mx[up] = cp;
			p[lp] = mx[lp] = (mx[sp] + cp);
		}
		this.setScrollThreshold(list);
	},
	/**
		Retrieves the assumed position for the requested page index.
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
		Retrieves the default page size.
	*/
	defaultPageSize: function (list) {
		var perPage = list.controlsPerPage || this.controlsPerPage(list);
		return (perPage * (list.childSize || 100));
	},
	/**
		Retrieves the number of pages for for given list.
	*/
	pageCount: function (list) {
		var perPage = list.controlsPerPage || this.controlsPerPage(list);
		return (Math.ceil(list.length / (perPage || 1)));
	},
	/**
		Retrieves the current (and desired) scroll position from the scroller
		for the given list.
	*/
	getScrollPosition: function (list) {
		return list.$.scroller.getScrollTop();
	},
	scrollHandler: function (list, bounds) {
		var last = this.pageCount(list)-1,
			pos  = this.pagesByPosition(list);
		if ((bounds.xDir === 1 || bounds.yDir === 1) && pos.lastPage.index !== (last)) {
			this.generatePage(list, pos.firstPage, pos.lastPage.index + 1);
			this.adjustPagePositions(list);
			this.adjustBuffer(list);
			// note that the reference to the page positions has been udpated by
			// another method so we trust the actual pages
			list.triggerEvent("paging", {
				start: pos.firstPage.start,
				end: pos.lastPage.end,
				action: "scroll"
			});
		} else if ((bounds.xDir === -1 || bounds.yDir === -1) && pos.firstPage.index !== 0) {
			this.generatePage(list, pos.lastPage, pos.firstPage.index - 1);
			this.adjustPagePositions(list);
			// note that the reference to the page positions has been udpated by
			// another method so we trust the actual pages
			list.triggerEvent("paging", {
				start: pos.firstPage.start,
				end: pos.lastPage.end,
				action: "scroll"
			});
		}
	},
	setScrollThreshold: function (list) {
		var threshold = list.scrollThreshold || (list.scrollThreshold={}),
			metrics   = list.metrics.pages,
			pos       = this.pagesByPosition(list),
			firstIdx  = pos.firstPage.index,
			lastIdx   = pos.lastPage.index,
			count     = this.pageCount(list)-1,
			lowerProp = list.lowerProp,
			upperProp = list.upperProp,
			fn        = upperProp == "top"? this.height: this.width;
		// now to update the properties the scroller will use to determine
		// when we need to be notified of position changes requiring paging
		if (firstIdx === 0) {
			threshold[upperProp] = undefined;
		} else {
			threshold[upperProp] = metrics[lastIdx][upperProp] - fn(list);
		}
		if (lastIdx === count) {
			threshold[lowerProp] = undefined;
		} else {
			threshold[lowerProp] = metrics[firstIdx][lowerProp];
		}
		if (list.usingScrollListener) {
			list.$.scroller.setScrollThreshold(threshold);
		}
	},
	resetToPosition: function (list, px) {
		if (px >= 0 && px <= list.bufferSize) {
			var index = Math.ceil(px / this.defaultPageSize(list)),
				last  = this.pageCount(list) - 1,
				pos   = this.pagesByPosition(list);
			if (
				(px <= pos.firstPage[list.upperProp]) ||
				(px >= pos.lastPage[list.lowerProp])
			) {
				list.$.page1.index = (index = Math.min(index, last));
				list.$.page2.index = (index === last? (index-1): (index+1));
				this.refresh(list);
				list.triggerEvent("paging", {
					start: list.$.page1.start,
					end: list.$.page2.end,
					action: "reset"
				});
			}
		}
	},
	/**
		Handles scroll events for the given list. The events themselves aren't
		helpful as depending on the underlying _scrollStrategy_ they have varied
		information. This is a hefty method but contained to keep from calling
		too many functions whenever this event is propagated.
	*/
	didScroll: function (list, event) {
		if (!list.usingScrollListener) {
			var threshold = list.scrollThreshold,
				bounds    = event.scrollBounds,
				lowerProp = list.lowerProp,
				upperProp = list.upperProp;
			if (bounds.xDir === 1 || bounds.yDir === 1) {
				if (bounds[upperProp] > threshold[lowerProp]) {
					this.scrollHandler(list, bounds);
				}
			} else if (bounds.yDir === -1 || bounds.xDir === -1) {
				if (bounds[upperProp] < threshold[upperProp]) {
					this.scrollHandler(list, bounds);
				}
			}
		}
	},
	/**
		Delegate's resize event handler.
	*/
	didResize: function (list) {
		list._updateBounds = true;
		this.updateBounds(list);
		this.refresh(list);
	},
	/**
		Returns the height for the given list, will cache this value and reuse
		if no resizing of the list has taken place.
	*/
	height: function (list) {
		if (list._updateBounds) { this.updateBounds(list); }
		return list.boundsCache.height;
	},
	/**
		Returns the width for the given list, will cache this value and reuse
		if no resizing of the list has takekn place.
	*/
	width: function (list) {
		if (list._updateBounds) { this.updateBounds(list); }
		return list.boundsCache.width;
	},
	/**
		Updates the cached values for the sizing of the given list.
	*/
	updateBounds: function (list) {
		list.boundsCache    = list.getBounds();
		list._updatedBounds = enyo.bench();
		list._updateBounds  = false;
	}
};
