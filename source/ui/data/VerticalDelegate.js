//*@protected
/**
	This is a delegate (strategy) used by _enyo.DataList_ for vertically oriented
	lists. This is used by all lists for this strategy and does not get copied but
	called directly from the list.
*/
enyo.DataList.delegates.vertical = {
	/**
		Simply set the priority properties for this orientation that can be differentiated
		by other delegates that wish to share some basic functionality.
	*/
	initList: function (list) {
		if (list.$.scroller.addScrollListener) {
			list.usingScrollListener = true;
			list.$.scroller.addScrollListener(
				enyo.bindSafely(this, "scrollHandler", list)
			);
		}
		list.upperProp = "top";
		list.lowerProp = "bottom";
		list.psizeProp = "height";
		list.ssizeProp = "width";
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
	},
	/**
		Returns a hash of the pages marked by there position as either 'firstPage' or 'lastPage'.
	*/
	pagesByPosition: function (list) {
		var metrics   = list.metrics.pages,
			pos       = list.pagePositions || (list.pagePositions={});
		pos.firstPage = (
			metrics[list.$.page1.index][list.upperProp] < metrics[list.$.page2.index][list.upperProp]
			? list.$.page1
			: list.$.page2			
		);
		pos.lastPage  = pos.firstPage === list.$.page1? list.$.page2: list.$.page1;
		return pos;
	},
	/**
		Refreshes each page in the given list, adjusting their positions and adjusting
		the buffer accordingly.
	*/
	refresh: function (list) {
		if (!list.hasReset) { return this.reset(list); }
		var pc = Math.max(this.pageCount(list)-1, 0),
			fi = list.$.page1.index,
			si = list.$.page2.index;
		if (fi > pc) { fi = pc; }
		if (si > pc) { si = (fi == pc && pc !== 0)? fi-1: fi+1; }
		list.$.page1.index = fi;
		list.$.page2.index = si;
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
			// the collection of data with records to use
		var data    = list.collection,
			// the metrics for the entire list
			metrics = list.metrics,
			// placeholder for the control we're going to update
			view;
		// in case it hasn't been set we ensure it is marked correctly
		page.index  = index;
		// the first index for this generated page
		page.start  = list.controlsPerPage * index;
		// the last index for this generated page
		page.end    = Math.min(data.length, page.start + list.controlsPerPage);
		// if generating a control we need to use the correct page as the control parent
		list.controlParent = page;
		for (var i=page.start; i < page.end && i < data.length; ++i) {
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
		var pi = list.$.page1.index,
			n  = list.$.page1.node || list.$.page1.hasNode(),
			sp = list.psizeProp;
		if (pi >= 0 && n) {
			list.childSize = Math.floor(list.metrics.pages[pi][sp] / (n.children.length || 1));
		}
	},
	/**
		Retrieves the page index for the given record index.
	*/
	pageForIndex: function (list, i) {
		return Math.floor(i / (list.controlsPerPage || 1));
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
			list.$.page1.index = p;
			list.$.page2.index = (p+1);
			this.refresh(list);
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
		return false;
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
				up = list.upperProp,
				lp = list.lowerProp,
				sp = list.psizeProp;
			p.node.style[up] = cp + "px";
			p[up] = mx[up] = cp;
			p[lp] = mx[lp] = (mx[sp] + cp);
			if (i===0) { this.childSize(list); }
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
		return (list.controlsPerPage * (list.childSize || 100));
	},
	/**
		Retrieves the number of pages for for given list.
	*/
	pageCount: function (list) {
		return (Math.ceil(list.length / (list.controlsPerPage || 1)));
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
		} else if ((bounds.xDir === -1 || bounds.yDir === -1) && pos.firstPage.index !== 0) {
			this.generatePage(list, pos.lastPage, pos.firstPage.index - 1);
			this.adjustPagePositions(list);
		}
	},
	setScrollThreshold: function (list) {
		var threshold = list.scrollThreshold || (list.scrollThreshold={}),
			metrics   = list.metrics.pages,
			pos       = this.pagesByPosition(list),
			last      = this.pageCount(list)-1,
			firstIdx  = pos.firstPage.index,
			lastIdx   = pos.lastPage.index;
		// now to update the properties the scroller will use to determine
		// when we need to be notified of position changes requiring paging
		threshold[list.upperProp] = metrics[lastIdx][list.upperProp] - this.height(list);
		threshold[list.lowerProp] = metrics[firstIdx][list.lowerProp];
		if (list.usingScrollListener) {
			list.$.scroller.setScrollThreshold(threshold);
		}
	},
	resetToPosition: function (list, px) {
		if (px >= 0 && px <= list.bufferSize) {
			var index = Math.ceil(px / this.defaultPageSize(list)),
				last  = this.pageCount(list)-1;
			list.$.page1.index = (index = Math.min(index, last));
			list.$.page2.index = (index === last? (index-1): (index+1));
			this.refresh(list);
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
				metrics   = list.metrics.pages,
				pos       = this.pagesByPosition(list);
			if (bounds.xDir === 1 || bounds.yDir === 1) {
				if (bounds[list.upperProp] > threshold[list.lowerProp]) {
					if (bounds[list.upperProp] < metrics[pos.lastPage.index][list.lowerProp]) {
						this.scrollHandler(list, bounds);
					} else {
						this.resetToPosition(list, bounds[list.upperProp]);
					}
				}
			} else if (bounds.yDir === -1 || bounds.xDir === -1) {
				if (bounds[list.upperProp] < threshold[list.upperProp]) {
					if (bounds[list.upperProp] > metrics[pos.firstPage.index][list.upperProp]) {
						this.scrollHandler(list, bounds);
					} else {
						this.resetToPosition(list, bounds[list.upperProp]);
					}
				}
			}
		}
	},
	/**
		Delegate's resize event handler.
	*/
	didResize: function (list) {
		list._updateBounds = true;
		clearTimeout(list._resizeTimerId);
		list._resizeTimerId = setTimeout(function () {
			list.delegate.updateBounds(list);
			list.delegate.refresh(list);
		}, 400);
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
		list.boundsCache   = list.getBounds();
		list._updateBounds = false;
	}
};
