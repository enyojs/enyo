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
			* @default 1
			* @public
			*/
			size: 1,

			/**
			* Sets whether the enyo.Select can select multiple options
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			multiple: false
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
				this.updateValue();
				this.sizeChanged();
				this.multipleChanged();
			};
		}),

		/**
		* @private
		*/
		getSelected: function () {
			if (this.hasNode()) {
				return Number(this.node.selectedIndex);
			}
		},

		/**
		* @private
		*/
		selectedChanged: function () {
			if (this.hasNode() && !this.updating) {
				this.node.selectedIndex = this.selected;
			}
		},
		/**
		* @private
		*/
		valueChanged: function() {
			if (this.hasNode() && !this.updating) {
				//Needs delay otherwise it won't update value (at least on chrome 42 canary)
				this.startJob('updateValue', function() {
					this.node.value = this.value;
					this.set('selected', this.getSelected());
				}, 100);
			}
		},
		/**
		* @private
		*/
		sizeChanged: function() {
			if (this.hasNode()) {
				this.node.size = this.size;
			}
		},
		/**
		* @private
		*/
		multipleChanged: function() {
			if (this.hasNode()) {
				this.node.multiple = this.multiple;
			}
		},
		/**
		* @private
		*/
		updateValue: function() {
			if (this.hasNode()) {
				this.set('value', this.node.value);
			}
		},
		/**
		* @private
		*/
		change: function () {
			//Need to know internally if we are changing values,
			//to prevent value and selected observers from firing
			//until maximum_call_stack error is received
			//But we still want this control's owner to be able to bind
			//to changes of either or both of the selected and value properties
			this.updating = true;
			this.set('selected', this.getSelected());
			this.updateValue();
			this.updating = false;
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
