require('enyo');

var
	dispatcher = require('./dispatcher'),
	util = require('./utils'),
	Dom = require('./dom');

var _baseScreen,
	_orientation,
	_riRatio,
	_screenType,
	_workspaceBounds = {
		width: (typeof global === 'object') ? global.innerWidth : 1920,
		height: (typeof global === 'object') ? global.innerHeight : 1080
	},
	_screenTypes = [{
		name: 'standard',
		pxPerRem: 16,
		width: _workspaceBounds.width,
		height: _workspaceBounds.height,
		aspectRatioName: 'standard',
		base: true
	}],	// Assign one sane type in case defineScreenTypes is never run.
	_screenTypeObject,
	_oldOrientation,
	_oldScreenTypeObject,
	configDefaults = {
		orientationHandling: 'normal'
	};


var getScreenTypeObject = function (type) {
	type = type || _screenType;
	if (_screenTypeObject && _screenTypeObject.name == type) {
		return _screenTypeObject;
	}
	return _screenTypes.filter(function (elem) {
		return (type == elem.name);
	})[0];
};

/**
* Resolution independence methods
* @module enyo/resolution
*/
var ri = module.exports = {
	config: {},

	/**
	* Sets up screen resolution scaling capabilities by defining an array of all the screens
	* being used. These should be listed in order from smallest to largest, according to
	* width.
	*
	* The `name`, `pxPerRem`, `width`, and `aspectRatioName` properties are required for
	* each screen type in the array. Setting `base: true` on a screen type marks it as the
	* default resolution, upon which everything else will be based.
	*
	* Executing this method also initializes the rest of the resolution-independence code.
	*
	* ```
	* ri.defineScreenTypes([
	* 	{name: 'vga',     pxPerRem: 8,  width: 640,  height: 480,  aspectRatioName: 'standard'},
	* 	{name: 'xga',     pxPerRem: 16, width: 1024, height: 768,  aspectRatioName: 'standard'},
	* 	{name: 'hd',      pxPerRem: 16, width: 1280, height: 720,  aspectRatioName: 'hdtv'},
	* 	{name: 'fhd',     pxPerRem: 24, width: 1920, height: 1080, aspectRatioName: 'hdtv', base: true},
	* 	{name: 'uw-uxga', pxPerRem: 24, width: 2560, height: 1080, aspectRatioName: 'cinema'},
	* 	{name: 'uhd',     pxPerRem: 48, width: 3840, height: 2160, aspectRatioName: 'hdtv'}
	* ]);
	* ```
	*
	* @param {Array} types - An array of objects containing screen configuration data, as in the
	* preceding example.
	* @public
	*/
	defineScreenTypes: function (types) {
		_screenTypes = types;
		for (var i = 0; i < _screenTypes.length; i++) {
			if (_screenTypes[i]['base']) _baseScreen = _screenTypes[i];
		}
		ri.init();
	},

	/**
	* Update the common measured boundary object. This object is used as "what size screen are we
	* looking at". Providing no arguments has no effect and updates nothing.
	*
	* @memberOf ui/resolution
	* @param {Node} measurementNode A standard DOM node or the `window` node.
	*
	* @returns {undefined}
	* @private
	*/
	updateWorkspaceBounds: function (measurementNode) {
		if (measurementNode && (measurementNode.clientHeight || measurementNode.clientWidth)) {
			_workspaceBounds = {height: measurementNode.clientHeight, width: measurementNode.clientWidth};
		} else if (measurementNode && (measurementNode.innerHeight || measurementNode.innerWidth)) {
			// A backup for if measurementNode is actually `window` and not a normal node
			_workspaceBounds = {height: measurementNode.innerHeight, width: measurementNode.innerWidth};
		}
	},

	/**
	* Fetches the name of the screen type that best matches the current screen size. The best
	* match is defined as the screen type that is the closest to the screen resolution without
	* going over. ("The Price is Right" style.)
	*
	* @param {Object} [rez] - Optional measurement scheme. Must include `height` and `width` properties.
	* @returns {String} Screen type (e.g., `'fhd'`, `'uhd'`, etc.)
	* @public
	*/
	getScreenType: function (rez) {
		rez = rez || _workspaceBounds || {
			height: 1080,
			width: 1920
		};

		var types = _screenTypes,
			bestMatch = types[types.length - 1].name; // Blindly set the first screen type, in case no matches are found later.

		_orientation = 'landscape';

		if (rez.height > rez.width) {
			_orientation = 'portrait';
			var swap = rez.width;
			rez.width = rez.height;
			rez.height = swap;
		}

		// Loop thorugh resolutions, last->first, largest->smallest
		for (var i = types.length - 1; i >= 0; i--) {
			// Find the screenType that matches our current size or is smaller. Default to the first.
			if (rez.height <= types[i].height && rez.width <= types[i].width) {
				bestMatch = types[i].name;
			}
		}
		// Return the name of the closest fitting set of demensions.
		return bestMatch;
	},

	/**
	* @private
	*/
	updateScreenBodyClasses: function (type) {
		type = type || _screenType;
		if (_oldOrientation) {
			Dom.removeBodyClass('enyo-orientation-' + _oldOrientation);
		}
		if (_oldScreenTypeObject) {
			Dom.removeBodyClass('enyo-res-' + _oldScreenTypeObject.name.toLowerCase());
			if (_oldScreenTypeObject.aspectRatioName) {
				Dom.removeBodyClass('enyo-aspect-ratio-' + _oldScreenTypeObject.aspectRatioName.toLowerCase());
			}
		}
		if (_orientation) {
			Dom.addBodyClass('enyo-orientation-' + _orientation);
		}
		if (type) {
			Dom.addBodyClass('enyo-res-' + type.toLowerCase());
			var scrObj = getScreenTypeObject(type);
			if (scrObj.aspectRatioName) {
				Dom.addBodyClass('enyo-aspect-ratio-' + scrObj.aspectRatioName.toLowerCase());
			}
			return type;
		}
	},

	/**
	* @private
	*/
	updateBaseFontSize: function (size) {
		document.documentElement.style.fontSize = size;
	},

	/**
	* @private
	*/
	getRiRatio: function (type) {
		type = type || _screenType;
		if (type && _baseScreen) {
			var ratio = this.getUnitToPixelFactors(type) / this.getUnitToPixelFactors(_baseScreen.name);
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
	* Calculates the aspect ratio of the specified screen type. If no screen type is provided,
	* the current screen type is used.
	*
	* @param {String} type - Screen type whose aspect ratio will be calculated. If no screen
	* type is provided, the current screen type is used.
	* @returns {Number} The calculated screen ratio (e.g., `1.333`, `1.777`, `2.333`, etc.)
	* @public
	*/
	getAspectRatio: function (type) {
		var scrObj = getScreenTypeObject(type);
		if (scrObj.width && scrObj.height) {
			return (scrObj.width / scrObj.height);
		}
		return 1;
	},

	/**
	* Returns the name of the aspect ratio for a specified screen type, or for the default
	* screen type if none is provided.
	*
	* @param {String} type - Screen type whose aspect ratio name will be returned. If no
	* screen type is provided, the current screen type will be used.
	* @returns {String} The name of the screen type's aspect ratio
	* @public
	*/
	getAspectRatioName: function (type) {
		var scrObj = getScreenTypeObject(type);
		 return scrObj.aspectRatioName || 'standard';
	},

	/**
	* Takes a provided pixel value and performs a scaling operation based on the current
	* screen type.
	*
	* @param {Number} px - The quantity of standard-resolution pixels to scale to the
	* current screen resolution.
	* @returns {Number} The scaled value based on the current screen scaling factor
	* @public
	*/
	scale: function (px) {
		return (_riRatio || this.getRiRatio()) * px;
	},

	/**
	* The default configurable [options]{@link ri.selectSrc#options}.
	*
	* @typedef {Object} ri.selectSrc~src
	* @property {String} hd - HD / 720p Resolution image asset source URI/URL
	* @property {String} fhd - FHD / 1080p Resolution image asset source URI/URL
	* @property {String} uhd - UHD / 4K Resolution image asset source URI/URL
	*
	* @typedef {String} ri.selectSrc~src - Image asset source URI/URL
	*/

	/**
	* Selects the ideal image asset from a set of assets, based on various screen
	* resolutions: HD (720p), FHD (1080p), UHD (4k). When a `src` argument is
	* provided, `selectSrc()` will choose the best image with respect to the current
	* screen resolution. `src` may be either the traditional string, which will pass
	* straight through, or a hash/object of screen types and their asset sources
	* (keys:screen and values:src). The image sources will be used when the screen
	* resolution is less than or equal to the provided screen types.
	*
	* ```
	* // Take advantage of the multi-res mode
	* var
	* 	kind = require('enyo/kind'),
	* 	Image = require('enyo/Image');
	*
	* {kind: Image, src: {
	* 	'hd': 'http://lorempixel.com/64/64/city/1/',
	* 	'fhd': 'http://lorempixel.com/128/128/city/1/',
	* 	'uhd': 'http://lorempixel.com/256/256/city/1/'
	* }, alt: 'Multi-res'},
	*
	* // Standard string `src`
	* {kind: Image, src: http://lorempixel.com/128/128/city/1/', alt: 'Large'},
	* ```
	*
	* @param {(String|module:enyo/resolution#selectSrc~src)} src - A string containing
	* a single image source or a key/value hash/object containing keys representing screen
	* types (`'hd'`, `'fhd'`, `'uhd'`, etc.) and values containing the asset source for
	* that target screen resolution.
	* @returns {String} The chosen source, given the string or hash provided
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
	* Calculate the base rem font size. This is how the magic happens. This accepts an
	* optional screenType name. If one isn't provided, the currently detected screen type is used.
	* This uses the config option "orientationHandling", which when set to "scale" and the screen is
	* in portrait orientation, will dynamically calculate what the base font size should be, if the
	* width were proportionally scaled down to fit in the portrait space.
	*
	* To use, put the following in your application code:
	* ```
	* 	var RI = require('moonstone/resolution');
	*
	* 	RI.config.orientationHandling = 'scale';
	* 	RI.init();
	* ```
	*
	* This has no effect if the screen is in landscape, or if orientationHandling is unset.
	*
	* @param {String} type - Screen type to base size the calculation on. If no
	*     screen type is provided, the current screen type will be used.
	* @returns {String} The calculated pixel size (with unit suffix. Ex: "24px").
	* @public
	*/
	calculateFontSize: function (type) {
		var size,
			scrObj = getScreenTypeObject(type);

		if (_orientation == 'portrait' && this.config.orientationHandling == 'scale') {
			size = scrObj.height / scrObj.width * scrObj.pxPerRem;
		} else {
			size = scrObj.pxPerRem;
		}
		return size + 'px';
	},

	/**
	* This will need to be re-run any time the screen size changes, so all the values can be
	* re-cached.
	*
	* @public
	*/
	// Later we can wire this up to a screen resize event so it doesn't need to be called manually.
	init: function (args) {
		this.updateWorkspaceBounds(args && args.measurementNode);
		_oldScreenTypeObject = _screenTypeObject;
		_oldOrientation = _orientation;
		_screenType = this.getScreenType();
		_screenTypeObject = getScreenTypeObject();
		this.updateScreenBodyClasses();
		Dom.unitToPixelFactors.rem = this.getUnitToPixelFactors();
		_riRatio = this.getRiRatio();
		this.updateBaseFontSize(this.calculateFontSize());
	}
};

ri.config = util.clone(configDefaults);
ri.init(document.body);

// We need to re-initialize the resolution config before any components receive their resize event
// and calculate any resolution-dependent values. There's currently no means in dispatcher to jump
// the line before enyo/master other than features.
dispatcher.features.push(function (ev) {
	if (ev.type === 'resize') {
		ri.init({measurementNode: document.body});
	}
});
