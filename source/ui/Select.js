(function (enyo, scope) {
	/**
	* {@link enyo.Select} implements an HTML [selection]{@glossary select} widget, using
	* {@link enyo.Option} instances by default.
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
	* Note: This uses the [&lt;select&gt;]{@glossary select} tag, which isn't implemented for
	* native webOS applications, although it does work in the webOS Web browser.
	*
	* @class enyo.Select
	* @extends enyo.Control
	* @ui
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
		kind: 'enyo.Control',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Select.prototype */ {
			
			/**
			* The index of the selected [option]{@link enyo.Option} in the list.
			* 
			* @type {Number}
			* @default 0
			* @public
			*/
			selected: 0,

			/**
			* The value of the selected [option]{@link enyo.Option}.
			* 
			* @type {Object}
			* @default null
			* @public
			*/
			value: null,

			/**
			* The size of the select box in rows.
			* 
			* @type {Number}
			* @default 0
			* @public
			*/
			size: 0,

			/**
			* Sets whether the enyo.Select can select multiple options
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			multiple: false,

			/**
			* Sets whether the enyo.Select is disabled, or not
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			disabled: false
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
				this.selectedChanged();
				this.valueChanged();
				this.sizeChanged();
				this.multipleChanged();
				this.disabledChanged();
			};
		}),

		/**
		* @private
		*/
		getSelected: function () {
			return Number(this.getNodeProperty('selectedIndex', this.selected));
		},

		/**
		* @private
		*/
		selectedChanged: function () {
			this.setNodeProperty('selectedIndex', this.selected);
			this.set('value', this.getNodeProperty('value', this.value));
		},
		/**
		* @private
		*/
		valueChanged: function() {
			this.setNodeProperty('value', this.value);
			this.set('selected', this.getSelected());
		},
		/**
		* @private
		*/
		sizeChanged: function() {
			this.setNodeProperty('size', this.size);
		},
		/**
		* @private
		*/
		multipleChanged: function() {
			this.setNodeProperty('multiple', this.multiple);
		},
		/**
		* @private
		*/
		disabledChanged: function() {
			this.setNodeProperty('disabled', this.disabled);
		},
		/**
		* @private
		*/
		change: function () {
			this.set('selected', this.getSelected());
		},

		/**
		* @method
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
	* {@link enyo.Option} implements the [options]{@glossary option} in an
	* {@link enyo.Select} [control]{@link enyo.Control}.
	*
	* @class enyo.Option
	* @extends enyo.Control
	* @ui
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
		kind: 'enyo.Control',

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
			* Set to `true` if this [option]{@link enyo.Option} is selected (default is `false`).
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
		* @method
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
		valueChanged: function () {
			this.setAttribute('value', this.value);
		},

		/**
		* @private
		*/
		selectedChanged: function () {
			this.setAttribute('selected', this.selected);
		}
	});

	/**
	* {@link enyo.OptionGroup} allows for the [grouping]{@glossary optgroup} of
	* [options]{@link enyo.Option} in an {@link enyo.Select} [control]{@link enyo.Control}, 
	* and for the disabling of blocks of options.
	*
	* @class enyo.OptionGroup
	* @extends enyo.Control
	* @ui
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
		kind: 'enyo.Control',

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
		* @method
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
		labelChanged: function () {
			this.setAttribute('label', this.label);
		}
	});

})(enyo, this);
