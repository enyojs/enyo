var
	utils = require('./utils'),
	Signals = require('./Signals');

/**
* Support for the W3C Page Visibility API - http://www.w3.org/TR/page-visibility
*
* {@link module:enyo/pageVisibility.hidden} and {@link module:enyo/pageVisibility.visibilityState}
* contain the same information as `document.hidden` and
* `document.visibilityState` in supported browsers. The `visibilitychange`
* event is channelled through the [Signals]{@link module:enyo/Signals~Signals} mechanism.
*
* Partly based on {@linkplain http://stackoverflow.com/a/1060034}.
*
* Example:
*
* ```javascript
* var
* 	kind = require('enyo/kind'),
* 	Signals = require('enyo/Signals');
*
* module.exports = kind({
* 	name: 'App',
* 	components: [
* 		{kind: 'Signals', onvisibilitychange: 'visibilitychanged'}
* 	],
* 	visibilitychanged: function() {
* 		if(enyo.hidden){
* 			// page hidden
* 		} else {
* 			// page visible
* 		}
* 	}
* });
* ```
*
* @module enyo/pageVisibility
* @private
*/
var 
	doc = global.document,
	hidden = 'hidden',
	visibilityState = 'visibilityState',
	hiddenMap = {};

var pageVisibility = module.exports = {
	// set inital values for enyo.hidden and enyo.visibilityState it's probably save to assume
	// that the current document is visible when loading the page
	/**
	* `true` if the document is hidden; otherwise, `false`.
	*
	* @readonly
	* @type {Boolean}
	* @default false
	* @public
	*/
	hidden: typeof doc[hidden] !== 'undefined' ? doc[hidden] : false,

	/**
	* String indicating the document's visibility state.
	*
	* @readonly
	* @type {String}
	* @default 'visible'
	* @public
	*/
	visibilityState: typeof doc[visibilityState] !== 'undefined' ? doc[visibilityState] : 'visible'
};

// map compatibility events to document.hidden state
hiddenMap.blur = hiddenMap.focusout = hiddenMap.pagehide = true;
hiddenMap.focus = hiddenMap.focusin = hiddenMap.pageshow = false;

function onchange (event) {
	event = event || global.event;
	pageVisibility.hidden = (event.type in hiddenMap) ? hiddenMap[event.type] : doc[hidden];
	pageVisibility.visibilityState = (event.type in hiddenMap) ? (hiddenMap[event.type] ? 'hidden' : 'visible' ) : doc[visibilityState];
	Signals.send('onvisibilitychange', utils.mixin(event, {hidden: pageVisibility.hidden}));
}

// Standards:
if (hidden in doc) {
	doc.addEventListener('visibilitychange', onchange);
} else if ((hidden = 'mozHidden') in doc) {
	doc.addEventListener('mozvisibilitychange', onchange);
	visibilityState = 'mozVisibilityState';
} else if ((hidden = 'webkitHidden') in doc) {
	doc.addEventListener('webkitvisibilitychange', onchange);
	visibilityState = 'webkitVisibilityState';
} else if ((hidden = 'msHidden') in doc) {
	doc.addEventListener('msvisibilitychange', onchange);
	visibilityState = 'msVisibilityState';
} else if ('onfocusin' in doc) { // IE 9 and lower:
	doc.onfocusin = doc.onfocusout = onchange;
} else { // All others:
	global.onpageshow = global.onpagehide = global.onfocus = global.onblur = onchange;
}
