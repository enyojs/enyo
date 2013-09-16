(function (enyo) {
	//*@protected
	/**
		This is a delegate (strategy) used by _enyo.DataGridList_ for vertically oriented
		lists. This is used by all lists for this strategy and does not get copied but
		called directly from the list. It is only available to _enyo.DataGridLists_.
	*/
	var p = enyo.clone(enyo.DataGridList.delegates.vertical);
	enyo.kind.extendMethods(p, {
		/**
			Once the list is initially rendered it will generate its scroller (so
			we know that is available). Now we need to cache our initial size values
			and apply them to our pages individually.
		*/
		rendered: function (list) {
			// get our initial sizing cached now since we should actually have
			// bounds at this point
			this.updateMetrics(list);
			// now if we already have a length then that implies we have a controller
			// and that we have data to render at this point, otherwise we don't
			// want to do any more initialization
			if (list.length) { this.reset(list); }
		},
		pageHeight: function (list, page) {
			if (list._didClaimChildren) { return this._pageHeight(list, page); }
			var n  = page.node || page.hasNode(),
				a  = n.children.length,
				mx = list.metrics.pages[page.index], s;
			s = (Math.floor(a/list.columns)+(a%list.columns? 1: 0))*(list.tileHeight+list.spacing);
			n.style.height = s + "px";
			mx.height = s;
			return s;
		},
		/**
			Returns the calculated height for the given page when the nodes have been
			claimed and may/may-not be visible.
		*/
		_pageHeight: function (list, page) {
			var a  = 0,
				cn = page.children,
				mx = list.metrics.pages[page.index], s;
			for (var i=0, c; (c=cn[i]); ++i) { if (c.getShowing()) { ++a; } }
			s = (Math.floor(a/list.columns)+(a%list.columns? 1: 0))*(list.tileHeight+list.spacing);
			mx.height = s;
			return s;
		},
		generatePage: enyo.inherit(function (sup) {
			return function (list, page, index) {
				if (!list._didClaimChildren) {
					sup.call(this, list, page, index, true);
					this.layout(list, page);
				} else {
					this._generatePage(list, page, index);
					this._layout(list, page);
				}
			};
		}),
		/**
			Once the nodes have been claimed by this type of list it isn't efficient to
			continually generate markup and force layouts (that are synchronous) so we
			reuse the control already claiming the node.
		*/
		_generatePage: function (list, page, index) {
			var dd = list.get("data"),
				cc = list.controlsPerPage,
				// the initial index (in the data) to start with
				pi = cc * index,
				// the final index of the page
				pf = Math.min(dd.length, pi + cc), d, dc, c;
			// set the pages index value
			page.index = index;
			page.start = pi;
			page.end = pf;
			list.controlParent = page;
			// i is the iteration index of the child in the children's array of the page
			// j is the iteration index of the dataset for each child
			for (var i=0, j=pi; j<pf; ++i, ++j) {
				d = dd.at(j);
				c = page.children[i] || ((dc=true) && list.createComponent({}));
				// we want to keep notifications from occurring until we're done
				// setting up
				if (!c.getShowing()) { c.setShowing(true); }
				if (c.model !== d) {
					c.stopNotifications();
					c.set("model", d)
					.set("index", j)
					.set("selected", list.isSelected(d));
					c.startNotifications();
				}
			}
			if (i<page.children.length) {
				for (; i<page.children.length; ++i) { page.children[i].setShowing(false); }
			}
			if (dc) { page.renderReusingNode(); }
			// now we need to update the known metrics cached for this page if we need to
			var mx = list.metrics.pages[index] || (list.metrics.pages[index] = {});
			// we will need to get the actual sizes for the page
			mx.height = this.pageHeight(list, page);
			mx.width = this.pageWidth(list, page);
			// if we haven't already done this, update our _default_ child size for various
			// calculations later
			if (!list.childSize) { this.childSize(list); }
		},
		/**
			Returns the calculated width for the given page.
		*/
		pageWidth: function (list, page) {
			var s  = list.boundsCache.width,
				n  = page.node || page.hasNode(),
				mx = list.metrics.pages[page.index];
			n.style.width = s + "px";
			mx.width = s;
			return s;
		},
		/**
			Retrieves the default page size.
		*/
		defaultPageSize: function (list) {
			return (Math.ceil(list.controlsPerPage/list.columns) * (list.tileHeight+list.spacing));
		},
		/**
			Calculates metric values required for the absolute positioning and scaling of
			the children in the list.
		*/
		updateMetrics: function (list) {
			this.updateBounds(list);
			var bs = list.boundsCache,
				w  = bs.width,
				s  = list.spacing,
				m  = list.minWidth,
				h  = list.minHeight;
			// the number of columns is the ratio of the available width minus the spacing
			// by the minimum tile width plus the spacing
			list.columns = Math.max(Math.floor((w-s) / (m+s)), 1);
			// the actual tile width is a ratio of the remaining width after all columns
			// and spacing are accounted for and the number of columns that we know we should have
			list.tileWidth = /*Math.floor*/((w-(s*(list.columns+1)))/list.columns);
			// the actual tile height is related to the tile width
			list.tileHeight = /*Math.floor*/(h*(list.tileWidth/m));
			// unfortunately this forces us to recalculate the number of controls that can
			// be used for each page
			this.controlsPerPage(list);
		},
		/**
			The number of controls necessary to fill a page will change depending on some
			factors such as scaling and list-size adjustments. It is a function of the calculated
			size required (1.2 * the current boundary height) and the adjusted tile height and
			spacing.
		*/
		controlsPerPage: function (list) {
			var ts  = list.tileHeight+list.spacing,
				hs  = list.boundsCache.height*1.5,
				cp  = Math.floor(hs/ts)*list.columns;
			list.controlsPerPage = cp;
		},
		/**
			Takes a given page and arbitrarily positions its children according to the pre-computed
			metrics of the list.
	
			TODO: This could be optimized to use requestAnimationFrame as well as render not by
			child index but by row thus cutting down some of the over-calculation when iterating
			over every child.
		*/
		layout: function (list, page) {
			var cc = list.columns,
				s  = list.spacing,
				w  = list.tileWidth,
				h  = list.tileHeight,
				r  = 0,
				n  = page.node || page.hasNode(),
				cn = n.children, co;
			if (cn.length) {
				for (var i=0, c; (c=cn[i]); ++i) {
					// the column
					co = i % cc;
					c.style.top    = (s  + (r  * (h+s))) + "px";
					c.style.left   = (s  + (co * (w+s))) + "px";
					c.style.width  = (w) + "px";
					c.style.height = (h) + "px";
					// check if we need to increment the row
					if ((i+1) % cc === 0) { ++r; }
				}
			}
		},
		/**
			Takes a given page and arbitrarily positions its children according to the pre-computed
			metrics of the list.
	
			TODO: This could be optimized to use requestAnimationFrame as well as render not by
			child index but by row thus cutting down some of the over-calculation when iterating
			over every child.
		*/
		_layout: function (list, page) {
			var cc = list.columns,
				s  = list.spacing,
				w  = list.tileWidth,
				h  = list.tileHeight,
				r  = 0,
				cn = page.children, co;
			if (cn.length) {
				for (var i=0, c; (c=cn[i]); ++i) {
					c = c.node || c.hasNode();
					// the column
					co = i % cc;
					c.style.top    = (s  + (r  * (h+s))) + "px";
					c.style.left   = (s  + (co * (w+s))) + "px";
					c.style.width  = (w) + "px";
					c.style.height = (h) + "px";
					// check if we need to increment the row
					if ((i+1) % cc === 0) { ++r; }
				}
			}
		},
		/**
			This is called at various moments to ensure that the required active controls
			are created and available as well as bound to the correct node after scrolling has
			stopped.
		*/
		_claimChildren: enyo.inherit(function (sup) {
			return function (delegate) {
				if (!this._didClaimChildren) { sup.apply(this, arguments); }
			};
		}),
		/**
			Delegate's resize event handler.
		*/
		didResize: function (list, event) {
			list._updateBounds = true;
			this.updateMetrics(list);
			// we need to update all of our page sizes so that the buffer can resize
			// close to properly
			list.metrics.pages = {};
			this.refresh(list);
			// find the top page
			var mx = list.metrics.pages,
				fi = list.$.page1.index,
				si = list.$.page2.index,
				tp = mx[fi].top < mx[si].top? mx[fi].top: mx[si].top;
			// ensure that the scroller is lined up with one of our pages
			list.$.scroller.setScrollTop(tp);
		}
	}, true);
	enyo.DataGridList.delegates.verticalGrid = p;
})(enyo);

