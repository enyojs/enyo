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
			list.$.flyweighter.canGenerate = true;
			this._scrollPulse = 0;
			// get our initial sizing cached now since we should actually have
			// bounds at this point
			this.updateMetrics(list);
			// now if we already have a length then that implies we have a controller
			// and that we have data to render at this point, otherwise we don't
			// want to do any more initialization
			if (list.length) { this.reset(list); }
		},
		/**
			Reset the page with the added check to ensure that we add the `transitions`
			class if they are enabled on the list.
		*/
		reset: enyo.inherit(function (sup) {
			return function (list) {
				sup.apply(this, arguments);
				if (list.allowTransitions && !list.hasClass("transitions")) {
					list.addClass("transitions");
				}
			};
		}),
		/**
			Unlike in DataList we can calculate the page heights since we know the structure
			and layout of the page precisely.
		*/
		pageHeight: function (list, page) {
			var n  = page.node || page.hasNode(),
				a  = n.children.length,
				mx = list.metrics.pages[page.index], s;
			s = (Math.floor(a/list.columns)+(a%list.columns? 1: 0))*(list.tileHeight+list.spacing);
			n.style.height = s + "px";
			mx.height = s;
			return s;
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
				pf = Math.min(dd.length, pi + cc),
				sx = list.styleCache || (list.styleCache={}),
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
				c.domCssText = sx[i] || c.domCssText;
				c.tagsValid = false;
				c.startNotifications();
				mk += c.generateHtml();
				c.teardownRender();
			}
			// take the flyweighted content and set it to the page
			n.innerHTML = mk;
			// now we need to update the known metrics cached for this page if we need to
			var mx = list.metrics.pages[index] || (list.metrics.pages[index] = {});
			// we will need to get the actual sizes for the page
			mx.height = this.pageHeight(list, page);
			mx.width = this.pageWidth(list, page);
			// if we haven't already done this, update our _default_ child size for various
			// calculations later
			if (!list.childSize) { this.childSize(list); }
			this.layout(list, page);
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
				sx = list.styleCache || (list.styleCache={}),
				cn = n.children, co;
			if (cn.length) {
				for (var i=0, c; (c=cn[i]); ++i) {
					// the column
					co = i % cc;
					c.style.top    = (s  + (r  * (h+s))) + "px";
					c.style.left   = (s  + (co * (w+s))) + "px";
					c.style.width  = (w) + "px";
					c.style.height = (h) + "px";
					sx[i] = c.style.cssText;
					// check if we need to increment the row
					if ((i+1) % cc === 0) { ++r; }
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
				for (var i=0; i<pc; ++i) {
					p = list.metrics.pages[i];
					bs += (p && p[sp]) || ds;
				}
				bs += list.spacing;
				list.bufferSize = bs;
				n.style[sp] = bs + "px";
				n.style[ss] = this[ss](list) + "px";
			}
		},
		/**
			Delegate's resize event handler.
		*/
		didResize: function (list, event) {
			list._updateBounds = true;
			clearTimeout(list._resizeTimerId);
			list._resizeTimerId = setTimeout(function () {
				list.delegate.updateMetrics(list);
				// we need to update all of our page sizes so that the buffer can resize
				// close to properly
				list.metrics.pages = {};
				list.delegate.refresh(list);
				// find the top page
				var mx = list.metrics.pages,
					fi = list.$.page1.index,
					si = list.$.page2.index,
					tp = mx[fi].top < mx[si].top? mx[fi].top: mx[si].top;
				// ensure that the scroller is lined up with one of our pages
				list.$.scroller.setScrollTop(tp);
			}, 400);
		}
	}, true);
	enyo.DataGridList.delegates.verticalGrid = p;
})(enyo);

