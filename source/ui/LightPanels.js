(function (enyo, scope) {
	/**
	* A light-weight panels implementation that has basic support for side-to-side transitions
	* between child components.
	*
	* @class moon.LightPanels
	* @extends enyo.LightPanels
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends moon.LightPanels.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.LightPanels',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		classes: 'enyo-light-panels',

		/**
		* @private
		* @lends moon.LightPanels.prototype
		*/
		published: {

			/**
			* The index of the active panel.
			*
			* @type {Number}
			* @default 0
			* @public
			*/
			index: 0,

			/**
			* Indicates whether the panels animate when transitioning.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			animate: true,

			/**
			* Indicates whether panels "wrap around" when moving past the end.
			* The actual effect depends upon the arranger in use.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			wrap: false,

			/**
			* When `true`, panels are automatically popped when the user moves back.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			popOnBack: true,

			/**
			* The amount of time, in milliseconds, to run the transition animation between panels.
			*
			* @type {Number}
			* @default 350
			* @public
			*/
			duration: 350
		},

		/**
		* @private
		*/
		handlers: {
			ontransitionend: 'transitionFinished'
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.indexChanged();
			};
		}),

		/**
		* @private
		*/
		indexChanged: function (previousIndex) {
			var panels = this.getPanels(),
				nextPanel = panels[this.index];

			this._direction = (this.index - previousIndex < 0 ? -1 : 1);

			if (nextPanel) {
				// only animate transition if there is more than one panel and/or we're animating
				if (panels.length == 1 || !this.animate) {
					nextPanel.applyStyle('-webkit-transition-duration', '0s');
					nextPanel.applyStyle('transition-duration', '0s');
				} else {
					nextPanel.applyStyle('-webkit-transition', enyo.format('-webkit-transform %.ms linear', this.duration));
					nextPanel.applyStyle('transition', enyo.format('transform %.ms linear', this.duration));
					this._currentPanel.applyStyle('-webkit-transition', enyo.format('-webkit-transform %.ms linear', this.duration));
					this._currentPanel.applyStyle('transition', enyo.format('-webkit-transform %.ms linear', this.duration));
				}
				setTimeout(this.bindSafely(function () {
					enyo.dom.transform(nextPanel, {translateX: '-100%'});
					enyo.dom.transform(nextPanel, {translateZ: 0});
					if (this._currentPanel) {
						enyo.dom.transform(this._currentPanel, {translateX: this._direction > 0 ? '-200%' : '0%'});
						enyo.dom.transform(this._currentPanel, {translateZ: 0});
					}
					this._currentPanel = nextPanel;
				}), 16);
			}
		},

		/**
		* Transitions to the previous panel--i.e., the panel whose index value is one
		* less than that of the current active panel.
		*
		* @public
		*/
		previous: function () {
			var prevIndex = this.index - 1;
			if (this.wrap && prevIndex < 0) {
				prevIndex = this.getPanels().length - 1;
			}
			this.set('index', prevIndex);
		},

		/**
		* Transitions to the next panel--i.e., the panel whose index value is one
		* greater than that of the current active panel.
		*
		* @public
		*/
		next: function () {
			var nextIndex = this.index+1;
			if (this.wrap && nextIndex >= this.getPanels().length) {
				nextIndex = 0;
			}
			this.set('index', nextIndex);
		},

		/**
		* Creates a panel on top of the stack and increments index to select that component.
		*
		* @param {Object} info - The declarative {@glossary kind} definition.
		* @param {Object} moreInfo - Additional properties to be applied (defaults).
		* @return {Object} The instance of the panel that was created on top of the stack.
		* @public
		*/
		pushPanel: function (info, moreInfo) {
			var lastIndex = this.getPanels().length - 1,
				nextPanel = this.createComponent(info, moreInfo);
			nextPanel.render();
			this.set('index', lastIndex + 1, true);

			// TODO: When pushing panels after we have gone back (but have not popped), we need to
			// adjust the position of the panels after the previous index before our push.
			return nextPanel;
		},

		/**
		* Creates multiple panels on top of the stack and updates index to select the last one
		* created. Supports an optional `options` object as the third parameter.
		*
		* @param {Object[]} info - The declarative {@glossary kind} definitions.
		* @param {Object} commonInfo - Additional properties to be applied (defaults).
		* @param {Object} options - Additional options for pushPanels.
		* @return {null|Object[]} Array of the panels that were created on top of the stack, or
		*	`null` if panels could not be created.
		* @public
		*/
		pushPanels: function (info, commonInfo, options) {
			var lastIndex = this.getPanels().length,
				newPanels = this.createComponents(info, commonInfo),
				idx;

			for (idx = 0; idx < newPanels.length; ++idx) {
				newPanels[idx].render();
			}

			this.set('index', lastIndex, true);

			return newPanels;
		},

		/**
		* @private
		*/
		getPanels: function () {
			/*jshint -W093 */
			return (this._panels = this._panels || (this.controlParent || this).children);
		},

		/**
		* Destroys panels whose index is greater than or equal to a specified value.
		*
		* @param {Number} index - Index at which to start destroying panels.
		* @public
		*/
		popPanels: function (index) {
			var panels = this.getPanels();
			index = index || panels.length - 1;

			while (panels.length > index && index >= 0) {
				panels[panels.length - 1].destroy();
			}
		},

		/**
		* @private
		*/
		transitionFinished: function (sender, ev) {
			if (ev.originator === this._currentPanel && this.popOnBack && this._direction < 0
				&& this.index < this.getPanels().length - 1) this.popPanels(this.index + 1);
		}

	});

})(enyo, this);
