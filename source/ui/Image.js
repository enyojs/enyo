(function (enyo, scope) {
	/**
	* Fires when the [image]{@link enyo.Image} has loaded.
	*
	* @event enyo.Image#onload
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when there has been an error when loading the [image]{@link enyo.Image}.
	*
	* @event enyo.Image#onerror
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.Image_ implements an HTML [&lt;img&gt;]{@link external:img} element and, optionally, 
	* [bubbles]{@link enyo.Component#bubble} the [onload]{@link enyo.Image#event:onload} and 
	* [onerror]{@link enyo.Image#event:onerror} [events]{@link external:event}. Image dragging is 
	* suppressed by default, so as not to interfere with touch interfaces.
	*
	* @class enyo.Image
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Image.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Image',
		
		/**
		* When `true`, no [onload]{@link enyo.Image#event:onload} or 
		* [onerror]{@link enyo.Image#event:onerror} [event]{@link external:event} handlers will be 
		* created.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		noEvents: false,

		/**
		* @private
		*/
		published: {
			
			/**
			* Maps to the _alt_ attribute of an [img tag]{@link external:img}.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Image.prototype
			* @public
			*/
			alt: '',

			/**
			* By default, the [image]{@link enyo.Image} is rendered using an `<img>` tag.  When this 
			* property is set to `'cover'` or `'constrain'`, the [image]{@link enyo.Image} is 
			* rendered using a `<div>`, utilizing `background-image` and `background-size`.
			* 
			* Set this property to `'constrain'` to letterbox the [image]{@link enyo.Image} in the 
			* available space, or `'cover'` to cover the available space with the 
			* [image]{@link enyo.Image} (cropping the larger dimension).  Note, when _sizing_ is set,
			* the control must be explicitly sized.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Image.prototype
			* @public
			*/
			sizing: '',

			/**
			* When [sizing]{@link enyo.Image#sizing} is used, this property sets the positioning of 
			* the [image]{@link enyo.Image} within the bounds, corresponding to the 
			* [`background-position`]{@link external:backgroundPosition} CSS property.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Image.prototype
			* @public
			*/
			position: 'center'
		},
		
		/**
		* @private
		*/
		tag: 'img',

		/**
		* @private
		*/
		classes: 'enyo-image',

		/**
		* @namespace enyo.Image.attributes
		* @public
		*/
		attributes: 
		/** @lends enyo.Image.attributes */ {

			/**
			* Note: The _draggable_ attribute takes one of these [String]{@link external:String} 
			* values: 'true', 'false', 'auto' (Boolean `false` would remove the attribute).
			* 
			* @type {String}
			* @default 'false'
			* @public
			*/
			draggable: 'false'
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				if (this.noEvents) {
					delete this.attributes.onload;
					delete this.attributes.onerror;
				}
				sup.apply(this, arguments);
				this.altChanged();
				this.sizingChanged();
				this.srcChanged();
			};
		}),

		/**
		* @private
		*/
		getSrc: function () {
			return this.getAttribute('src');
		},

		/**
		* @private
		*/
		setSrc: function (src) {
			var was = this.src;
			this.src = src;
			
			if (was !== src) this.notify('src', was, src);
		},

		/**
		* @private
		*/
		srcChanged: function () {
			if (this.sizing && this.src) {
				this.applyStyle('background-image', 'url(' + enyo.path.rewrite(this.src) + ')');
			} else {
				if (!this.src) {
					// allow us to clear the src property
					this.setAttribute('src', '');
				} else {
					this.setAttribute('src', enyo.path.rewrite(this.src));
				}
			}
		},

		/**
		* @private
		*/
		altChanged: function() {
			this.setAttribute('alt', this.alt);
		},

		/**
		* @private
		*/
		sizingChanged: function(inOld) {
			this.tag = this.sizing ? 'div' : 'img';
			this.addRemoveClass('sized', !!this.sizing);
			if (this.inOld) {
				this.removeClass(inOld);
			}
			if (this.sizing) {
				this.addClass(this.sizing);
			}
			if (this.generated) {
				this.srcChanged();
				this.render();
			}
		},

		/**
		* @private
		*/
		positionChanged: function() {
			if (this.sizing) {
				this.applyStyle('background-position', this.containPosition);
			}
		},

		/**
		* @fires enyo.Image#event:onload
		* @fires enyo.Image#event:onerror
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				enyo.makeBubble(this, 'load', 'error');
			};
		}),

		/**
		* @private
		*/
		statics: {
			/**
				A globally accessible data URL that describes a simple
				placeholder image that can be used in samples and applications
				until final graphics are provided. As a SVG image, it will
				expand to fill the desired width and height set in the style.
			*/
			placeholder:
				'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
				'9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cmVjdCB3aWR0aD0iMTAw' +
				'JSIgaGVpZ2h0PSIxMDAlIiBzdHlsZT0ic3Ryb2tlOiAjNDQ0OyBzdHJva2Utd2lkdGg6IDE7IGZpbGw6ICNhYW' +
				'E7IiAvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIxMDAlIiBzdHlsZT0ic3Ryb2tlOiAjNDQ0' +
				'OyBzdHJva2Utd2lkdGg6IDE7IiAvPjxsaW5lIHgxPSIxMDAlIiB5MT0iMCIgeDI9IjAiIHkyPSIxMDAlIiBzdH' +
				'lsZT0ic3Ryb2tlOiAjNDQ0OyBzdHJva2Utd2lkdGg6IDE7IiAvPjwvc3ZnPg=='
		}
	});
})(enyo, this);
