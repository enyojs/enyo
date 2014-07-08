(function (enyo, scope) {
	/**
	* _enyo.Select_ implements an HTML [selection]{@link external:select} widget, using 
	* {@link enyo.Option} [kinds]{@link external:kind} by default.
	*
	* ```
	* {kind: 'Select', onchange: 'selectChanged', components: [
	*	{content: 'Descending', value: 'd'},
	*	{content: 'Ascending', value: 'a'}
	* ]}
	* 
	* selectChanged: function(inSender, inEvent) {
	*	var s = inSender.getValue();
	*	if (s == 'd') {
	*		this.sortListDescending();
	*	} else {
	*		this.sortListAscending();
	*	}
	* }
	* ```
	* 
	* Note: This uses the [`&lt;select&gt;`]{@link external:select} tag, which isn't implemented for
	* native webOS applications, although it does work in the webOS Web browser.
	*
	* @class enyo.Select
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Select.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Select',

		/**
		* @private
		*/
		published: {
			
			/**
			* Index of the selected [option]{@link enyo.Option} in the list.
			* 
			* @type {Number}
			* @default 0
			* @memberof enyo.Select.prototype
			* @public
			*/
			selected: 0,

			/**
			* The value of the selected [option]{@link enyo.Option}.
			* 
			* @type {Object}
			* @default null
			* @memberof enyo.Select.prototype
			* @public
			*/
			value: null
		},
		
		/**
		* @private
		*/
		handlers: {
			onchange: 'change'
		},

		/**
		* @private
		*/
		tag: 'select',

		/**
		* @private
		*/
		defaultKind: 'enyo.Option',

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				//Trick to force IE8 onchange event bubble
				if(enyo.platform.ie == 8){
					this.setAttribute('onchange', enyo.bubbler);
				}
				this.change();
				this.selectedChanged();
			};
		}),

		/**
		* @private
		*/
		getSelected: function() {
			return Number(this.getNodeProperty('selectedIndex', this.selected));
		},

		/**
		* @private
		*/
		selectedChanged: function() {
			this.setNodeProperty('selectedIndex', this.selected);
		},

		/**
		* @private
		*/
		change: function() {
			this.selected = this.getSelected();
			if (this.hasNode()) {
				this.set('value', this.node.value);
			}
		},

		/**
		* @private
		*/
		render: enyo.inherit(function (sup) {
			return function() {
				// work around IE bug with innerHTML setting of <select>, rerender parent instead
				// http://support.microsoft.com/default.aspx?scid=kb;en-us;276228
				if (enyo.platform.ie) {
					this.parent.render();
				} else {
					sup.apply(this, arguments);
				}
			};
		})
	});

	/**
	* _enyo.Option_ implements the [options]{@link external:option} in a 
	* [select]{@link external:select} [control]{@link enyo.Control}.
	*
	* @class enyo.Option
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Option.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Option',

		/**
		* @private
		*/
		published: {
			/**
			* Value of the [option]{@link enyo.Option}.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Option.prototype
			* @public
			*/
			value: '',

			/**
			* Set to `true` if this [option]{@link enyo.Option} is selected, `false` otherwise.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Option.prototype
			* @public
			*/
			selected: false
		},
		
		/**
		* @private
		*/
		tag: 'option',

		/**
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.valueChanged();
				this.selectedChanged();
			};
		}),

		/**
		* @private
		*/
		valueChanged: function() {
			this.setAttribute('value', this.value);
		},

		/**
		* @private
		*/
		selectedChanged: function() {
			this.setAttribute('selected', this.selected);
		}
	});

	/**
	* _enyo.OptionGroup_ allows for the [grouping]{@link external:optgroup} of 
	* [options]{@link enyo.Option} in a [select]{@link enyo.Select} [control]{@link enyo.Control}, 
	* and for the disabling of blocks of [options]{@link enyo.Option}.
	*
	* @class enyo.OptionGroup
	* @public
	*/
	enyo.kind(
		/** @lends enyo.OptionGroup.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.OptionGroup',

		/**
		* @private
		*/
		published: {
			/**
			* The name for this [option group]{@link enyo.OptionGroup}.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.OptionGroup.prototype
			* @public
			*/
			label: ''
		},
		
		/**
		* @private
		*/
		tag: 'optgroup',

		/**
		* @private
		*/
		defaultKind: 'enyo.Option',

		/**
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.labelChanged();
			};
		}),

		/**
		* @private
		*/
		labelChanged: function() {
			this.setAttribute('label', this.label);
		}
	});

})(enyo, this);
