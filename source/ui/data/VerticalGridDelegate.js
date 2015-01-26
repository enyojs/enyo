(function (enyo, scope) {
	/**
	* This is a [delegate]{@glossary delegate} (strategy) used by {@link enyo.DataGridList}
	* for vertically-oriented lists. This is used by all lists for this strategy; it does
	* not get copied, but is called directly from the list. It is only available to
	* `enyo.DataGridList`.
	*
	* @name enyo.DataGridList.delegates.verticalGrid
	* @type Object
	* @private
	*/
	var p = enyo.clone(enyo.DataGridList.delegates.vertical);
	enyo.kind.extendMethods(p, {
		
		/**
		* Once the list is initially rendered, it will generate its [scroller]{@link enyo.Scroller}
		* (so we know that is available). Now we need to cache our initial size values and apply
		* them to our pages individually.
		*
		* @private
		*/
		rendered: function (list) {
			// get our initial sizing cached now since we should actually have
			// bounds at this point
			this.updateMetrics(list);
			// calc offset of pages to scroller client
			this.calcScrollOffset(list);
			// now if we already have a length then that implies we have a controller
			// and that we have data to render at this point, otherwise we don't
			// want to do any more initialization
			if (list.collection && list.collection.length) { this.reset(list); }
		},
		
		/**
		* Resets the page, setting `canAddResetClass` flag if appropriate.
		*
		* @method
		* @private
		*/
		reset: enyo.inherit(function (sup) {
			return function (list) {
				sup.apply(this, arguments);
				if (list.hasReset && !list.hasClass('reset')) {
					list.canAddResetClass = true;
				}
			};
		}),
		
		/**
		* Unlike in {@link enyo.DataList}, we can calculate the page height since we know
		* the structure and layout of the page precisely.
		*
		* @private
		*/
		pageHeight: function (list, page) {
			var n  = page.node || page.hasNode(),
				a  = n.children.length,
				mx = list.metrics.pages[page.index], s;
			s = (Math.floor(a/list.columns)+(a%list.columns? 1: 0))*(list.tileHeight+list.spacing);
			n.style.height = s + 'px';
			mx.height = s;
			return s;
		},

		/**
		* Generates the markup for the page content.
		*
		* @method
		* @private
		*/
		generatePage: enyo.inherit(function (sup) {
			return function (list, page) {
				sup.apply(this, arguments);
				this.layout(list, page);
			};
		}),

		/**
		* Returns the calculated width for the given page.
		*
		* @private
		*/
		pageWidth: function (list, page) {
			var s  = this.width(list),
				n  = page.node || page.hasNode(),
				mx = list.metrics.pages[page.index];
			n.style.width = s + 'px';
			mx.width = s;
			return s;
		},

		/**
		* Retrieves the default page size.
		*
		* @private
		*/
		defaultPageSize: function (list) {
			return (Math.ceil(this.controlsPerPage(list)/list.columns) * (list.tileHeight+list.spacing));
		},

		/**
		* Calculates metric values required for the absolute positioning and scaling of the
		* children in the list.
		*
		* @private
		*/
		updateMetrics: function (list) {
			this.updateBounds(list);
			this.calculateMetrics(list);
		},

		calculateMetrics: function (list, width) {
			var w  = (width === undefined) ? this.width(list) : width,
				s  = list.spacing,
				m  = list.minWidth,
				h  = list.minHeight;
			// the number of columns is the ratio of the available width minus the spacing
			// by the minimum tile width plus the spacing
			list.columns    = Math.max(Math.floor((w-s) / (m+s)), 1);
			// the actual tile width is a ratio of the remaining width after all columns
			// and spacing are accounted for and the number of columns that we know we should have
			list.tileWidth  = ((w-(s*(list.columns+1)))/list.columns);
			// the actual tile height is related to the tile width
			list.tileHeight = (h*(list.tileWidth/m));
			// unfortunately this forces us to recalculate the number of controls that can
			// be used for each page
			this.controlsPerPage(list, true);
			// Compute first and last row index bounds
			this.updateIndexBound(list);
		},

		/**
		* Calculates index bound that is required for adjusting page position. Can be called
		* after the [DataGridList]{@link enyo.DataGridList} is rendered.
		*
		* @private
		*/
		updateIndexBound: function(list) {
			if (!list.collection) {
				return;
			}
			// If user calls this method before DataGridList is rendered
			if (list.boundsCache === undefined) {
				this.updateMetrics(list);
			}

			list.indexBoundFirstRow = list.columns;
			list.indexBoundLastRow = (Math.ceil(list.collection.length / list.columns) - 1) * list.columns - 1;
		},

		/**
		* Ensures that index bound is maintained and up-to-date as
		* [models]{@link enyo.Model} are added.
		*
		* @method
		* @private
		*/
		modelsAdded: enyo.inherit(function (sup) {
			return function (list, props) {
				this.calculateMetrics(list);
				sup.apply(this, arguments);
			};
		}),

		/**
		* Ensures that index bound is maintained and up-to-date as
		* [models]{@link enyo.Model} are removed.
		*
		* @method
		* @private
		*/
		modelsRemoved: enyo.inherit(function (sup) {
			return function (list, props) {
				this.calculateMetrics(list);
				sup.apply(this, arguments);
			};
		}),


		/**
		* This method calculates the number of [controls]{@link enyo.Control} necessary to
		* fill a page. It inherits from the same method in
		* [verticalDelegate]{@link DataList.delegates.vertical} and extends it to reflect
		* the number of columns in the grid list.
		*
		* @method
		* @private
		*/
		calculateControlsPerPage: enyo.inherit(function (sup) {
			return function(list) {
				return sup.apply(this, arguments) * list.columns;
			};
		}),

		/*
		* @private
		*/
		childSize: function (list) {
			// currently DataGridList is only vertical
			/*jshint -W093 */
			return (list.childSize = (list.tileHeight + list.spacing));
		},

		/**
		* Takes a given page and arbitrarily positions its children according to the pre-computed
		* metrics of the list.
	
		* TODO: This could be optimized to use requestAnimationFrame as well as render not by child 
		* index but by row, thus cutting down some of the over-calculation when iterating over every 
		* child.
		*
		* @private
		*/
		layout: function (list, page) {
			if (list.canAddResetClass) {
				list.addClass('reset');
				delete list.canAddResetClass;
			}
			var cc = list.columns,
				s  = list.spacing,
				w  = list.tileWidth,
				h  = list.tileHeight,
				r  = 0,
				n  = page,
				cn = n.children, co;
			if (cn.length) {
				for (var i=0, c; (c=cn[i]); ++i) {
					// the column
					co = i % cc;
					c.addStyles(
						'top: '    + Math.round(s  + (r  * (h+s))) + 'px; ' +
						(list.rtl ? 'right: ' : 'left: ') + Math.round(s  + (co * (w+s))) + 'px; ' +
						'width: '  + Math.round(w) +                 'px; ' +
						'height: ' + Math.round(h) +                 'px;'
					);
					// check if we need to increment the row
					if ((i+1) % cc === 0) { ++r; }
				}
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
				for (var i=0; i<pc; ++i) {
					p = list.metrics.pages[i];
					bs += (p && p[sp]) || ds;
				}
				bs += list.spacing;
				list.bufferSize = bs;
				n.style[sp] = bs + 'px';
				n.style[ss] = this[ss](list) + 'px';
				list.$.scroller.remeasure();
			}
		},
		
		/**
		* The delegate's `resize` {@glossary event} handler.
		*
		* @private
		*/
		didResize: function (list) {
			// store the previous stats for comparative purposes
			var prev = list.boundsCache;
			
			// flag the list to have its bounds updated
			list._updateBounds = true;
			this.updateMetrics(list);
			
			// if no change it the viewport then we didn't update anything size-wise
			// and do not need to refresh at all
			if (
				prev.left   === list.boundsCache.left  &&
				prev.top    === list.boundsCache.top   &&
				prev.width  === list.boundsCache.width &&
				prev.height === list.boundsCache.height
			) {
				return;
			}
			
			// it is necessary to update the content of the list according to our
			// new sizing
			this.refresh(list);
		},

		/**
		* @see enyo.VerticalDelegate#adjustIndex
		* @private
		*/
		adjustIndex: enyo.inherit(function (sup) {
			return function (list, index, page, pageBounds, scrollBoundary, start) {
				var idx = sup.apply(this, arguments),
					delta = idx%list.columns;

				return idx - delta + (start? 0 : list.columns - 1);
			};
		})
	}, true);

	enyo.DataGridList.delegates.verticalGrid = p;

})(enyo, this);
