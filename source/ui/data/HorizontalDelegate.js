(function (enyo) {
	//*@protected
	/**
		This is a delegate (strategy) used by _enyo.DataList_ for horizontally oriented
		lists. This is used by all lists for this strategy and does not get copied but
		called directly from the list.

		Note that this is best off of the _vertical_ delegate and overloads only what is
		necessary since much of the logic is shared.
	*/
	var p = enyo.clone(enyo.DataList.delegates.vertical);
	enyo.kind.extendMethods(p, {
		/**
			Initialize the list by adding a class to modify the CSS properly and settings its
			priority properties.
		*/
		initList: enyo.inherit(function (sup) {
			return function (list) {
				sup.apply(this, arguments);
				// add the class
				list.addClass("horizontal");
				// set the priority properties
				list.posProp   = list.rtl ? "right" : "left";
				list.upperProp = "left";
				list.lowerProp = "right";
				list.psizeProp = "width";
				list.ssizeProp = "height";
				// set the scroller options
				var so         = list.scrollerOptions? (list.scrollerOptions = enyo.clone(list.scrollerOptions)): (list.scrollerOptions = {});
				// this is a horizontal list it cannot scroll vertically
				so.vertical    = "hidden";
				// it has to scroll vertically one way or another
				so.horizontal  = so.horizontal == "scroll"? "scroll": "auto";
			};
		}),
		destroyList: function (list) {
			if (list) {
				list.removeClass("horizontal");
			}
		},
		//* Overload to retrieve the correct scroll position
		getScrollPosition: function (list) {
			return list.$.scroller.getScrollLeft();
		},
		/**
			Overload to ensure we arbitrarily resize the _active_ container to the
			width of the buffer.
		*/
		adjustBuffer: enyo.inherit(function (sup) {
			return function (list) {
				sup.apply(this, arguments);
				var an = list.$.active.node || list.$.active.hasNode(),
					bs = list.bufferSize;
				if (an) {
					an.style.width = bs + "px";
				}
			};
		})
	}, true);
	enyo.DataList.delegates.horizontal = p;
})(enyo);
