(function(enyo, scope) {

	var _baseScreenType = 'standard',
		_riRatio,
		_screenType,
		_screenTypes = [ {name: 'standard', pxPerRem: 16} ],	// Assign one sane value in case defineScreenTypes is never run.
		_screenTypeObject;

	var getScreenTypeObject = function (name) {
		if (name == _screenType && _screenTypeObject) {
			return _screenTypeObject;
		}
		var types = _screenTypes;
		return types.filter(function (elem) {
			return (name == elem.name);
		})[0];
	};

	/**
	* @namespace enyo.ri
	*/
	enyo.ri = {
		/**
		* Setup screen resolution scaling capabilities by defining all of the screens you're working
		* with. These should be in the order of smallest to largest (according to width). Running
		* this also initializes the rest of this resolution code.
		*
		* In the arguments, the following properties are required: 'name', 'pxPerRem', 'width'.
		* The property 'base' defines the primary or default resoultion that everything else will be
		* based upon.
		*
		* ```
		* enyo.ri.defineScreenTypes([
		* 	{name: 'hd',    pxPerRem: 16, height: 720,  width: 1280},
		* 	{name: 'fhd',   pxPerRem: 24, height: 1080, width: 1920, base: true},
		* 	{name: 'uhd',   pxPerRem: 48, height: 2160, width: 3840}
		* ]);
		* ```
		*
		* @param {Array} types An array of objects with arguments like the example
		* @public
		*/
		defineScreenTypes: function (types) {
			_screenTypes = types;
			for (var i = 0; i < _screenTypes.length; i++) {
				if (_screenTypes[i]['base']) _baseScreenType = _screenTypes[i].name;
			}
			enyo.ri.init();
		},

		/**
		* Fetches the best-matching screen type name for the current screen size. The "best" screen type
		* is determined by the screen type name that is the closest to the screen resolution without
		* going over. ("The Price is Right" style.)
		*
		* @param {Object} [rez] - Optional measurement scheme. Must have "height" and "width" properties.
		* @returns {String} Screen type, like "fhd", "uhd", etc.
		* @public
		*/
		getScreenType: function (rez) {
			rez = rez || {
				height: scope.innerHeight,
				width: scope.innerWidth
			};
			var i,
				types = _screenTypes,
				bestMatch = types[types.length - 1].name;

			// loop thorugh resolutions
			for (i = types.length - 1; i >= 0; i--) {
				// find the one that matches our current size or is smaller. default to the first.
				if (rez.width <= types[i].width) {
					bestMatch = types[i].name;
				}
			}
			// return the name of the resolution if we find one.
			return bestMatch;
		},

		/**
		* @private
		*/
		updateScreenTypeOnBody: function (type) {
			type = type || _screenType;
			if (type) {
				enyo.dom.addBodyClass('enyo-res-' + type.toLowerCase());
				return type;
			}
		},

		/**
		* @private
		*/
		getRiRatio: function (type) {
			type = type || _screenType;
			if (type) {
				var ratio = this.getUnitToPixelFactors(type) / this.getUnitToPixelFactors(_baseScreenType);
				if (type == _screenType) {
					// cache this if it's for our current screen type.
					_riRatio = ratio;
				}
				return ratio;
			}
			return 1;
		},

		/**
		* @private
		*/
		getUnitToPixelFactors: function (type) {
			type = type || _screenType;
			if (type) {
				return getScreenTypeObject(type).pxPerRem;
			}
			return 1;
		},

		/**
		* Takes a provided pixel value and preforms a scaling operation on the number based on the
		* current screen type.
		*
		* @public
		*/
		scale: function (px) {
			return (_riRatio || this.getRiRatio()) * px;
		},

		/**
		* The default configurable [options]{@link enyo.ri.selectSrc#options}.
		*
		* @typedef {Object} enyo.ri.selectSrc~src
		* @property {String} hd - HD / 720p Resolution image asset source URI/URL
		* @property {String} fhd - FHD / 1080p Resolution image asset source URI/URL
		* @property {String} uhd - UHD / 4K Resolution image asset source URI/URL
		*
		* @typedef {String} enyo.ri.selectSrc~src - Image asset source URI/URL
		*/

		/**
		* Image src chooser. A simple utility method to select the ideal image asset from a set of
		* assets, based on various screen resolutions: HD (720p), FHD (1080p), UHD (4k). When provided
		* with a src argument, multiResSrc will choose the best image with respect to the current screen
		* resolution. `src` may be either the traditional string, which will pass straight through, or a
		* hash/object of screen types and their asset sources (keys:screen and values:src). The image
		* sources will be used chosen when the screen resolution is less than or equal to the provided
		* screen types.
		*
		* ```
		* // Take advantage of the multi-rez mode
		* {kind: 'moon.Image', src: {
		* 	'hd': 'http://lorempixel.com/64/64/city/1/',
		* 	'fhd': 'http://lorempixel.com/128/128/city/1/',
		* 	'uhd': 'http://lorempixel.com/256/256/city/1/'
		* }, alt: 'Multi-rez'},
		* // Standard string `src`
		* {kind: 'moon.Image', src: http://lorempixel.com/128/128/city/1/', alt: 'Large'},
		* ```
		*
		* @param {(String|moon.ri.selectSrc~src)} src A string containing a single image src or a
		*	key/value hash/object containing keys representing screen types (hd, fhd, uhd, etc) and
		*	values containing the asset src for that target screen resolution.
		* @returns {String} The choosen src given the string or list provided.
		* @public
		*/
		selectSrc: function (src) {
			if (typeof src != 'string' && src) {
				var i, t,
					newSrc = src.fhd || src.uhd || src.hd,
					types = _screenTypes;

				// loop through resolutions
				for (i = types.length - 1; i >= 0; i--) {
					t = types[i].name;
					if (_screenType == t && src[t]) newSrc = src[t];
				}

				src = newSrc;
			}
			return src;
		},

		/**
		* This will need to be re-run any time the screen size changes, so all the values can be
		* re-cached.
		*
		* @public
		*/
		// Later we can wire this up to a screen resize event so it doesn't need to be called manually.
		init: function () {
			_screenType = this.getScreenType();
			this.updateScreenTypeOnBody();
			enyo.dom.unitToPixelFactors.rem = this.getUnitToPixelFactors();
			_screenTypeObject = getScreenTypeObject();
			_riRatio = this.getRiRatio();
		}
	};

})(enyo, this);
