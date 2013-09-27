//*@protected
/**
	This is a delegate (strategy) used by _enyo.DataList_ for vertically oriented
	lists. This is used by all lists for this strategy and does not get copied but
	called directly from the list.
*/
enyo.DataList.delegates.vertical = {
	//* Pulse for how long to wait before executing the _claimChildren_ method.
	_scrollPulse: 0,
	/**
		Simply set the priority properties for this orientation that can be differentiated
		by other delegates that wish to share some basic functionality.
	*/
	initList: function (list) {
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
		for (var i=0, p; (p=list.pages[i]); ++i) { this.generatePage(list, p, i); }
		// adjust page positions
		this.adjustPagePositions(list);
		// now update the buffer
		this.adjustBuffer(list);
		this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
		list.hasReset = true;
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
		for (var i=0, p; (p=list.pages[i]); ++i) { this.generatePage(list, p, p.index); }
		// adjust their positions in case they've changed at all
		this.adjustPagePositions(list);
		// now update the buffer
		this.adjustBuffer(list);
		this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
	},
	/**
		Once the list is initially rendered it will generate its scroller (so
		we know that is available). Now we need to cache our initial size values
		and apply them to our pages individually.
	*/
	rendered: function (list) {
		list.$.flyweighter.canGenerate = true;
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
	generatePage: function (list, page, index, force) {
		var dd = list.get("data"),
			cc = list.controlsPerPage,
			// the initial index (in the data) to start with
			pi = cc * index,
			// the final index of the page
			of = page.end || 0,
			pf = Math.min(dd.length, pi + cc),
			c  = list.$.flyweighter,
			n  = page.node || page.hasNode(),
			mk = "", d;
		// set the pages index value
		page.index = index;
		page.start = pi;
		page.end = pf;
		// i is the iteration index of the child in the children's array of the page
		// j is the iteration index of the dataset for each child
		for (var i=0, j=pi; j<pf; ++i, ++j) {
			d = dd.at(j);
			// we want to keep notifications from occurring until we're done
			// setting up
			c.stopNotifications();
			c.set("model", d)
			.set("id", this.idFor(list, j), true)
			.set("index", j)
			.set("selected", list.isSelected(d));
			c.startNotifications();
			mk += c.generateHtml();
			c.teardownRender();
		}
		// take the flyweighted content and set it to the page
		n.innerHTML = mk;
		// now we need to update the known metrics cached for this page if we need to
		var mx = list.metrics.pages[index] || (list.metrics.pages[index] = {});
		// we will need to get the actual sizes for the page
		if (!mx.height || force || pf !== of) { mx.height = this.pageHeight(list, page); }
		if (!mx.width || force || pf !== of) { mx.width = this.pageWidth(list, page); }
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
		Generates or retrieves a unique _id_ for a control in the given list.
	*/
	idFor: function (list, i) {
		var ids = list._ids || (list._ids=[]),
			id  = ids[i] || (ids[i]=(list.id+"_list_child_id_"+i));
		return id;
	},
	/**
		Retrieves the page index for the given record index.
	*/
	pageForIndex: function (list, i) {
		return Math.floor(i / (list.controlsPerPage || 1));
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
		this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
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
			for (var j=0, c; (c=p.children[j]); ++j) { if (c.index == i) { return c; } }
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
			for (var i=0; i<pc || (i===0 && pc===0); ++i) {
				p = list.metrics.pages[i];
				bs += (p && p[sp]) || ds;
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
	/**
		Handles scroll events for the given list. The events themselves aren't
		helpful as depending on the underlying _scrollStrategy_ they have varied
		information. This is a hefty method but contained to keep from calling
		too many functions whenever this event is propagated.
	*/
	didScroll: function (list, event) {
		var sb = event.scrollBounds,
			pr = list.previousScrollPos,
			cr = (list.previousScrollPos = sb.top),
			p1 = list.$.page1,
			p2 = list.$.page2,
			sp = list.psizeProp,
			up = list.upperProp,
			lp = list.lowerProp,
			tp = (p1[up] > p2[up]? p2: p1),
			bp = p1 === tp? p2: p1,
			pc, pi, ps;
		list.scrolling = true;
		clearTimeout(list._scrollingId);
		list._scrollingId = setTimeout(function () {
			list.scrolling = false;
			list.delegate.flushScrollQueue(list);
		}, this._scrollPulse);
		if (pr === cr || (Math.abs((pr || 0)-cr) < 15)) {
			// reset so the next time we check we're checking the correct value
			list.previousScrollPos = pr;
			return;
		}
		// so we need to determine if the current scroll position is within the boundaries
		// of either of the known page positions, if so, we handle that as a move and adjust
		// accordingly
		if (
			(cr >= p1[up] && cr <= p1[lp]) ||
			(cr >= p2[up] && cr <= p2[lp])
		) {
			if (pr < cr || pr === undefined) {
				// we're scrolling down, make sure that if the top page is out of the visible
				// region we move it down
				if (cr > tp[lp]) {
					pc = this.pageCount(list)-1;
					// if the bottom page isn't the last page we can move the first page below
					if (bp.index < pc) {
						this.generatePage(list, tp, bp.index+1);
						this.adjustPagePositions(list);
						// we put this here because we want to eventually have the exact measurement
						// and in order to do this as rarely as possible means we have to check to
						// make sure this is the last index
						if (bp.index+1 == pc) { this.adjustBuffer(list); }
						// we need to tell the pages to claim the correct nodes according to updated id's
						// but only when scrolling has stopped so we don't do the work when we can't use it
						this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
					}
				}
			} else {
				// we're scrolling up, make sure that if the bottom page is out of the visible
				// region we move it up
				if ((cr + this[sp](list)) < bp[up]) {
					// we can only move the bottom page up if the top page isn't the first page
					// in the set (index 0)
					if (tp.index !== 0) {
						this.generatePage(list, bp, tp.index-1);
						this.adjustPagePositions(list);
						// we need to tell the pages to claim the correct nodes according to updated id's
						// but only when scrolling has stopped so we don't do the work when we can't use it
						this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
					}
				}
			}
		}
		// otherwise this was a jump of some-sort so we need to line them up with the new
		// position
		else {
			// this seems only possible with some strategies that allow a bounce to reduce
			// the scroll top below zero
			if (cr < 0) { return; }
			// either the events were firing quicker than we could process them or there was
			// an arbitrary jump so we need to check a few cases that need to be handled separately
			if (cr === 0) {
				// we need to reset to origin
				this.reset(list);
			} else if (cr === (sb[sp]-this[sp](list))) {
				// this is at the bottom so we need to generate bottom up from
				// the second page
				pc = this.pageCount(list);
				this.generatePage(list, p2, pc);
				this.generatePage(list, p1, pc-1);
				this.adjustPagePositions(list);
				this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
			} else {
				// otherwise we have no idea what happened, just some arbitrary change or
				// we were lagging, if the direction is up we take the bottom page and move
				// it, if it was down we take the top page and move it
				// to get the index of the page we need to generate based on the position of
				// the scroll offset
				ps = this.defaultPageSize(list);
				// the page index dependent on the current position
				pi = Math.ceil(cr/ps);
				if (pr < cr) {
					this.generatePage(list, tp, pi);
					this.generatePage(list, bp, pi+1);
					this.adjustPagePositions(list);
					this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
				} else {
					if (pi === 0) {
						this.reset(list);
					} else {
						this.generatePage(list, bp, pi);
						this.generatePage(list, tp, pi-1);
						this.adjustPagePositions(list);
						this.scrollQueue("claimChildren", list, function () { list.delegate.claimChildren(list); });
					}
				}
			}
		}
	},
	/**
		Delegate's resize event handler.
	*/
	didResize: function (list, event) {
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
		list.boundsCache = list.getBounds();
		list._updateBounds = false;
	},
	/**
		This is called at various moments to ensure that the required active controls
		are created and available as well as bound to the correct node after scrolling has
		stopped.
	*/
	claimChildren: function (list) {
		var fn = list.claimChildren || (list.claimChildren=list.bindSafely(this._claimChildren, this));
		setTimeout(fn, 0);
	},
	/**
		When actions need to be postponed until after scrolling has ended this method will
		queue them and they will be flushed when scrolling has ceased (beyond the pulse timer).
		The queue entry has a name so that the same entry will not enter the queue more than once.
	*/
	scrollQueue: function (name, list, callback) {
		var q = list.scrollQueue || (list.scrollQueue={});
		q[name] = callback;
		// it will be immediately flushed if the list isn't actually scrolling
		if (!list.scrolling) {
			this.flushScrollQueue(list);
		}
	},
	/**
		Flushes any queued actions that were waiting until scrolling was completed.
	*/
	flushScrollQueue: function (list) {
		if (!list.scrolling) {
			var q = list.scrollQueue;
			if (q) {
				for (var k in q) { q[k](); }
				list.scrollQueue = {};
			}
		}
	},
	/**
		This method is bound to individual list instances and executed to ensure that
		the required actions from _claimChildren_ are executed.
	*/
	_claimChildren: function (delegate) {
		var dd = this.get("data"),
			pi, pf, i, p, j, k, c, d;
		for (i=0; (p=this.pages[i]); ++i) {
			pi = p.start;
			pf = p.end;
			this.controlParent = p;
			if (pi >= 0 && pf >= 0) {
				for (j=pi, k=0; j<pf; ++j, ++k) {
					c = p.children[k] || this.createComponent({});
					d = dd.at(j);
					c.stopNotifications();
					c.set("model", d)
					.set("id", delegate.idFor(this, j), true)
					.set("index", j)
					.set("selected", this.isSelected(d))
					.startNotifications();
				}
			}
		}
	}
};
