(function (enyo, scope) {
	/**
	* This is a [delegate]{@glossary delegate} (strategy) used by {@link enyo.DataList}
	* for horizontally-oriented lists. This is used by all lists for this strategy;
	* it does not get copied, but is called directly from the list.
	*
	* Note that this is based on the [vertical delegate]{@link enyo.DataList.delegates.vertical}
	* and shares most of that delegate's logic. Overloads are implemented only where necessary.
	*
	* @name enyo.DataList.delegates.horizontal
	* @type Object
	* @private
	*/
	var p = enyo.clone(enyo.DataList.delegates.vertical);
	enyo.kind.extendMethods(p, {
		/**
		* Initializes the list, adding a class to modify the CSS properly and setting its
		* priority properties.
		*
		* @method
		* @private
		*/
		initList: enyo.inherit(function (sup) {
			return function (list) {
				sup.apply(this, arguments);
				// add the class
				list.addClass('horizontal');
				// set the priority properties
				list.posProp   = list.rtl ? 'right' : 'left';
				list.upperProp = 'left';
				list.lowerProp = 'right';
				list.psizeProp = 'width';
				list.ssizeProp = 'height';
				// set the scroller options
				var so         = list.scrollerOptions? (list.scrollerOptions = enyo.clone(list.scrollerOptions)): (list.scrollerOptions = {});
				// this is a horizontal list it cannot scroll vertically
				so.vertical    = 'hidden';
				// it has to scroll vertically one way or another
				so.horizontal  = so.horizontal == 'scroll'? 'scroll': 'auto';
			};
		}),

		/*
		* @private
		*/
		destroyList: function (list) {
			if (list) {
				list.removeClass('horizontal');
			}
		},
		/**
		* Overload to retrieve the correct scroll position.
		*
		* @private
		*/
		getScrollPosition: function (list) {
			return list.$.scroller.getScrollLeft();
		},

		/**
		* Sets the scroll position on the [scroller]{@link enyo.Scroller}
		* owned by the given list.
		*
		* @private
		*/
		setScrollPosition: function (list, pos) {
			list.$.scroller.setScrollLeft(pos);
		},
		
		/**
		* Overload to ensure we arbitrarily resize the active container to the width of the buffer.
		*
		* @method
		* @private
		*/
		adjustBuffer: enyo.inherit(function (sup) {
			return function (list) {
				sup.apply(this, arguments);
				var an = list.$.active.node || list.$.active.hasNode(),
					bs = list.bufferSize;
				if (an) {
					an.style.width = bs + 'px';
				}
			};
		})
	}, true);

	enyo.DataList.delegates.horizontal = p;

})(enyo, this);
