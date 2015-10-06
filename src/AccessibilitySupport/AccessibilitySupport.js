/**
* Mixin for adding WAI-ARIA attributes to controls
*
* @module enyo/AccessibilitySupport
*/

var
	dispatcher = require('../dispatcher'),
	kind = require('../kind'),
	platform = require('../platform'),
	utils = require('../utils');

var defaultObservers = [
	{from: 'accessibilityDisabled', method: function () {
		this.setAriaAttribute('aria-hidden', this.accessibilityDisabled ? 'true' : null);
	}},
	{from: 'accessibilityLive', method: function () {
		var live = this.accessibilityLive === true && 'assertive' || this.accessibilityLive || null;
		this.setAriaAttribute('aria-live', live);
	}},
	{path: ['accessibilityAlert', 'accessibilityRole'], method: function () {
		var role = this.accessibilityAlert && 'alert' || this.accessibilityRole || null;
		this.setAriaAttribute('role', role);
	}},
	{path: ['content', 'accessibilityHint', 'accessibilityLabel', 'tabIndex'], method: function () {
		var focusable = this.accessibilityLabel || this.content || this.accessibilityHint || false,
			prefix = this.accessibilityLabel || this.content || null,
			label = this.accessibilityHint && prefix && (prefix + ' ' + this.accessibilityHint) ||
					this.accessibilityHint ||
					this.accessibilityLabel ||
					null;

		this.setAriaAttribute('aria-label', label);

		// A truthy or zero tabindex will be set directly
		if (this.tabIndex || this.tabIndex === 0) {
			this.setAriaAttribute('tabindex', this.tabIndex);
		}
		// The webOS browser will only read nodes with a non-null tabindex so if the node has
		// readable content, make it programmably focusable.
		else if (focusable && this.tabIndex === undefined && platform.webos) {
			this.setAriaAttribute('tabindex', -1);
		}
		// Otherwise, remove it
		else {
			this.setAriaAttribute('tabindex', null);
		}
	}}
];

/**
* Prevents browser-initiated scrolling contained controls into view when those controls are
* explicitly focus()'ed.
*
* @private
*/
function preventScroll (node) {
	if (node) {
		dispatcher.listen(node, 'scroll', function () {
			node.scrollTop = 0;
			node.scrollLeft = 0;
		});
	}
}

function updateAriaAttributes (all) {
	var i, l, obs;

	for (i = 0, l = this._ariaObservers.length; i < l; i++) {
		obs = this._ariaObservers[i];
		if ((all || obs.pending) && obs.method) {
			obs.method();
			obs.pending = false;
		}
	}
}

function registerAriaUpdate (obj) {
	var fn;
	if (!obj.pending) {
		obj.pending = true;
		fn = this.bindSafely(updateAriaAttributes);
		if (!this.accessibilityDefer) {
			fn();
		} else {
			this.startJob('updateAriaAttributes', fn, 16);
		}
	}
}

function toAriaAttribute (from, to) {
	var value = this[from];
	this.setAriaAttribute(to, value === undefined ? null : value);
}

function staticToAriaAttribute (to, value) {
	this.setAriaAttribute(to, value);
}

function initAriaObservers (control) {
	var conf = control._ariaObservers,
		i, l, fn;

	control._ariaObservers = [];
	for (i = 0, l = defaultObservers.length; i < l; i++) {
		initAriaObserver(control, defaultObservers[i]);
	}
	if (conf) {
		for (i = 0, l = conf.length; i < l; i++) {
			initAriaObserver(control, conf[i]);
		}
	}

	// setup disabled observer and kickoff first run of observers
	fn = updateAriaAttributes.bind(control, true);
	control.addObserver('accessibilityDisabled', fn);
	fn();
}

function initAriaObserver (control, c) {
	var
		// path can either source from 'path' or 'from' (for binding-style configs)
		path = c.path || c.from,

		// method is either:
		// 		'method', if it exists, or
		// 		staticToAriaAttribute if 'to' and 'value' exist - static binding-style config, or
		// 		toAriaAttribute if a 'to' path exists - binding-style config
		method = c.method && control.bindSafely(c.method) ||
				!path && c.to && c.value !== undefined && control.bindSafely(staticToAriaAttribute, c.to, c.value) ||
				c.to && control.bindSafely(toAriaAttribute, path, c.to) ||
				null,

		// import the relevant and pre-validated parts into the instance-level config
		config = {
			path: path,
			method: method,
			pending: false
		},

		// pre-bind the register method as it's used multiple times when 'path' is an array
		fn = registerAriaUpdate.bind(control, config),

		// iterator
		l;

	control._ariaObservers.push(config);
	if (utils.isArray(path)) {
		for (l = path.length - 1; l >= 0; --l) {
			control.addObserver(path[l], fn);
		}
	}
	else if (path) {
		control.addObserver(path, fn);
	}
}

/**
* @mixin
*/
var AccessibilitySupport = {

	/**
	* @private
	*/
	name: 'enyo.AccessibilitySupport',

	/**
	* AccessibilityLabel is used for accessibility voice readout.
	* If accessibilityLabel is set, screen reader reads the label when control is focused.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	accessibilityLabel: '',

	/**
	* AccessibilityHint is used for additional information of control.
	* If accessibilityHint is set and content exists, screen reader
	* reads accessibilityHint with content when control is focused.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	accessibilityHint: '',

	/**
	* The `role` of the control. May be superceded by a truthy `accessibilityAlert` value.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	accessibilityRole: '',

	/**
	* AccessibilityAlert is for alert message or page description.
	* If accessibilityAlert is true, aria role will be set to "alert" and
	* screen reader will automatically reads content or accessibilityLabel
	* regardless focus.
	* Note that if you use accessibilityAlert, previous role will be
	* replaced with "alert" role.
	*
	* Range: [`true`, `false`]
	* - true: screen reader automatically reads label regardless focus.
	* - false: screen reader reads label with focus.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityAlert: false,

	/**
	* AccessibilityLive is for dynamic content which updates without a page reload.
	* If AccessibilityLive is true, screen reader will read content or accessibilityLabel
	* when it changed.
	*
	* Range: [`true`, `false`]
	* - true: screen reader reads content when it changed.
	* - false: screen reader reads content with focus.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityLive: false,

	/**
	* AccessibilityDisabled prevents VoiceReadout.
	* If accessibilityDisabled is true, screen reader doesn't read any label for the control.
	* Note that this is not working on HTML form elements which can get focus without tabindex.
	*
	* Range: [`true`, `false`]
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityDisabled: false,

	/**
	* When true, `onscroll` events will be observed and scrolling prevented by resetting the
	* `scrollTop` and `scrollLeft` of the node. This prevents inadvertent layout issues introduced
	* by the browser scrolling contained controls into view when `focus()`'ed.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	accessibilityPreventScroll: false,

	/**
	* Sets the `tabindex` of the control. When `undefined` on webOS, it will be set to -1 to enable
	* screen reading. A value of `null` (or `undefined` on non-webOS) ensures that no `tabindex` is
	* set.
	*
	* @type {Number}
	* @default undefined
	* @public
	*/

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function (props) {
			sup.apply(this, arguments);
			initAriaObservers(this);
		};
	}),

	/**
	* If accessibilityDisabled is `false`, sets the node attribute. Otherwise, removes it.
	*
	* @param {String} name  Attribute name
	* @param {String} value Attribute value
	* @public
	*/
	setAriaAttribute: function (name, value) {
		// if the control is disabled, don't set any aria properties except aria-hidden
		if (this.accessibilityDisabled && name != 'aria-hidden') {
			value = null;
		}
		// if the value is defined and non-null, cast it to a String
		else if (value !== undefined && value !== null) {
			value = String(value);
		}
		this.setAttribute(name, value);
	},

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.accessibilityPreventScroll) {
				preventScroll(this.hasNode());
			}
		};
	})
};

var sup = kind.concatHandler;
kind.concatHandler = function (ctor, props, instance) {
	sup.call(this, ctor, props, instance);

	var proto = ctor.prototype || ctor,
		ariaObservers = proto._ariaObservers && proto._ariaObservers.slice(),
		incoming = props.ariaObservers;

	if (incoming && incoming instanceof Array) {
		if (ariaObservers) {
			ariaObservers.push.apply(ariaObservers, incoming);
		} else {
			ariaObservers = incoming.slice();
		}
	}

	proto._ariaObservers = ariaObservers;
};

module.exports = AccessibilitySupport;