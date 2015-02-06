(function (enyo, scope) {
	/**
	* Fires when the [image]{@link enyo.Image} has loaded.
	*
	* @event enyo.Image#onload
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when there has been an error while loading the [image]{@link enyo.Image}.
	*
	* @event enyo.Image#onerror
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* {@link enyo.Image} implements an HTML [&lt;img&gt;]{@glossary img} element and, optionally,
	* [bubbles]{@link enyo.Component#bubble} the [onload]{@link enyo.Image#onload} and
	* [onerror]{@link enyo.Image#onerror} [events]{@glossary event}. Image dragging is suppressed by
	* default, so as not to interfere with touch interfaces.
	*
	* {@link enyo.Image} also has support for multi-resolution images. If you are developing assets
	* for specific screen sizes, HD (720p), FHD (1080p), UHD (4k), for example, you may provide
	* specific image assets in a hash/object format to the `src` property, instead of the usual
	* string. The image sources will be used automatically when the screen resolution is less than
	* or equal to those screen types. For more informaton on our resolution support, and how to
	* enable this feature, see our [resolution independence docs]{@link enyo.ri}.
	*
	* ```
	* // Take advantage of the multi-rez mode
	* {kind: 'enyo.Image', src: {
	* 	'hd': 'http://lorempixel.com/64/64/city/1/',
	* 	'fhd': 'http://lorempixel.com/128/128/city/1/',
	* 	'uhd': 'http://lorempixel.com/256/256/city/1/'
	* }, alt: 'Multi-rez'},
	* // Standard string `src`
	* {kind: 'enyo.Image', src: http://lorempixel.com/128/128/city/1/', alt: 'Large'},
	* ```
	*
	* @class enyo.Image
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Image.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Image',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* When `true`, no [onload]{@link enyo.Image#onload} or
		* [onerror]{@link enyo.Image#onerror} {@glossary event} handlers will be
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
		published:
			/** @lends enyo.Image.prototype */ {

			/**
			* Maps to the `src` attribute of an [&lt;img&gt; tag]{@glossary img}. This also supports
			* a multi-resolution hash object. See
			* [the above description of enyo.Image]{@link enyo.Image} for more details and examples
			* or our [resolution independence docs]{@link enyo.ri}.
			*
			* @type {String}
			* @default ''
			* @public
			*/
			src: '',

			/**
			* Maps to the `alt` attribute of an [&lt;img&gt; tag]{@glossary img}.
			*
			* @type {String}
			* @default ''
			* @public
			*/
			alt: '',

			/**
			* By default, the [image]{@link enyo.Image} is rendered using an `<img>` tag.
			* When this property is set to `'cover'` or `'constrain'`, the image will be
			* rendered using a `<div>`, utilizing `background-image` and `background-size`.
			*
			* Set this property to `'constrain'` to letterbox the image in the available
			* space, or `'cover'` to cover the available space with the image (cropping the
			* larger dimension).  Note that when `sizing` is set, the control must be
			* explicitly sized.
			*
			* @type {String}
			* @default ''
			* @public
			*/
			sizing: '',

			/**
			* When [sizing]{@link enyo.Image#sizing} is used, this property sets the positioning of
			* the [image]{@link enyo.Image} within the bounds, corresponding to the
			* [`background-position`]{@glossary backgroundPosition} CSS property.
			*
			* @type {String}
			* @default 'center'
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
		* @type {Object}
		* @property {Boolean} draggable - This attribute will take one of the following
		*	[String]{@glossary String} values: 'true', 'false' (the default), or 'auto'.
		* Setting Boolean `false` will remove the attribute.
		* @public
		*/
		attributes: {
			draggable: 'false'
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				if (this.noEvents) {
					delete this.attributes.onload;
					delete this.attributes.onerror;
				}
				sup.apply(this, arguments);
				this.altChanged();
				this.sizingChanged();
				this.srcChanged();
				this.positionChanged();
			};
		}),

		/**
		* @private
		*/
		srcChanged: function () {
			var src = enyo.ri.selectSrc(this.src);
			if (this.sizing) {
				this.applyStyle('background-image', src ? 'url(' + enyo.path.rewrite(src) + ')' : 'none');
			} else {
				if (!src) {
					// allow us to clear the src property
					this.setAttribute('src', '');
				} else {
					this.setAttribute('src', enyo.path.rewrite(src));
				}
			}
		},

		/**
		* @private
		*/
		altChanged: function () {
			this.setAttribute('alt', this.alt);
		},

		/**
		* @private
		*/
		sizingChanged: function (was) {
			this.tag = this.sizing ? 'div' : 'img';
			this.addRemoveClass('sized', !!this.sizing);
			if (was) {
				this.removeClass(was);
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
		positionChanged: function () {
			if (this.sizing) {
				this.applyStyle('background-position', this.position);
			}
		},

		/**
		* @fires enyo.Image#onload
		* @fires enyo.Image#onerror
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function () {
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
				placeholder image that may be used in samples and applications
				until final graphics are provided. As an SVG image, it will
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
