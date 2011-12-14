/**
A text input primitive with default visual treatment. For example:

	{kind: "BasicInput", value: "hello", onchange: "inputChange", onfocus: "inputFocus"}

The value property specifies the text displayed in the input. Note: the value property does not update as a user types.
Instead, when the input blurs (loses focus), the value property updates and the onchange event is fired.

It is common to use getValue and setValue to get and set the value of an input;
for example, to set the value of one input to that of another:

	buttonClick: function() {
		var x = this.$.input1.getValue();
		this.$.input2.setValue(x);
	}
*/
enyo.kind({
	name: "enyo.BasicInput",
	kind: enyo.Control,
	published: {
		value: "",
		disabled: false,
		readonly: false,
		placeholder: "",
		placeholderClassName: "",
		disabledClassName: "enyo-input-disabled",
		tabIndex: ""
	},
	events: {
		onfocus: "",
		onblur: "",
		onchange: "",
		onkeypress: ""
	},
	//* @protected
	tagName: "input",
	// NOTE: only required in browser, overridden below
	requiresDomMousedown: true,
	create: function() {
		this.inherited(arguments);
		this.placeholder = this.placeholder || this.hint || "";
		enyo.mixin(this.attributes, {
			onfocus: enyo.bubbler,
			onblur: enyo.bubbler
		});
		this.disabledChanged();
		this.readonlyChanged();
		this.valueChanged();
		this.placeholderChanged();
	},
	getDomValue: function() {
		if (this.hasNode()) {
			return this.node.value;
		}
	},
	setDomValue: function(inValue) {
		this.setAttribute("value", inValue);
		// FIXME: it's not clear when we need to set .value vs. using setAttribute above
		if (this.hasNode()) {
			this.node.value = inValue;
		}
		if (!this.isEmpty()) {
			this.addRemovePlaceholderClassName(false);
		}
	},
	mousedownHandler: function(inSender, inEvent) {
		if (this.disabled) {
			inEvent.preventDefault();
		}
		return this.fire("mousedown", inEvent);
	},
	changeHandler: function(inSender, inEvent) {
		// if we are re-rendered we won't show the proper value unless we capture it in attributes
		// we don't call setAttribute (or setDomValue) because of potential side-effects of altering the DOM
		this.attributes.value = this.getValue();
		// we have the option/responsibility to propagate this event to owner
		this.doChange(inEvent);
	},
	isEmpty: function() {
		return !this.getValue();
	},
	getValue: function() {
		if (this.hasNode()) {
			var v = this.getDomValue();
			if (enyo.isString(v)) {
				this.value = v;
			}
		}
		return this.value;
	},
	valueChanged: function() {
		this.setDomValue(this.value);
	},
	disabledChanged: function() {
		// NOTE: standard disabled attribute prevents all mouse events;
		// this could be avoided by not using this attribute;
		// however, this would make dealing with focus tab order complex 
		// (e.g. keyboard next focuses control: it should
		// not focus, but next control after this one should)
		this.setAttribute("disabled", this.disabled ? "disabled" : null);
		this.addRemoveClass(this.disabledClassName, this.disabled);
	},
	readonlyChanged: function() {
		this.setAttribute("readonly", this.readonly ? "readonly" : null);
	},
	placeholderChanged: function() {
		this.setAttribute("placeholder", this.placeholder);
	},
	tabIndexChanged: function() {
		this.setAttribute("tabindex", this.tabIndex);
	},
	focusHandler: function(inSender, e) {
		if (this.hasNode()) {
			if (this.isEmpty()) {
				this.updatePlaceholder(false);
			}
		}
		return this.disabled ? true : this.doFocus();
	},
	blurHandler: function(inSender, inEvent) {
		if (this.isEmpty()) {
			this.updatePlaceholder(true);
		}
		return this.doBlur();
	},
	updatePlaceholder: function(inApplyPlaceholder) {
		this.addRemovePlaceholderClassName(inApplyPlaceholder);
	},
	addRemovePlaceholderClassName: function(inApplyPlaceholder) {
		this.addRemoveClass(this.placeholderClassName, inApplyPlaceholder);
	},
	//* @public
	/**
	Force the input to receive keyboard focus.
	*/
	forceFocus: function(inCallback, inSync) {
		// has to be async in many cases (when responding to dom events, in particular) or it just fails
		if (inSync) {
			this.applyFocus(inCallback);
		} else {
			enyo.asyncMethod(this, "applyFocus", inCallback);
		}
	},
	//* @protected
	applyFocus: function(inCallback) {
		if (this.hasNode()) {
			this.node.focus();
			if (inCallback) {
				inCallback();
			}
		}
	},
	//* @public
	/**
		Forces this input to be blurred (lose focus).
	*/
	forceBlur: function(inCallback, inSync) {
		if (inSync) {
			this.applyBlur(inCallback);
		} else {
			enyo.asyncMethod(this, "applyBlur", inCallback);
		}
	},
	//* @protected
	applyBlur: function(inCallback) {
		if (this.hasNode()) {
			this.node.blur();
			if (inCallback) {
				inCallback();
			}
		}
	},
	//* @public
	/**
		Force select all text in this input.
	*/
	forceSelect: function(inCallback, inSync) {
		if (inSync) {
			this.applySelect(inCallback);
		} else {
			enyo.asyncMethod(this, "applySelect", inCallback);
		}
	},
	//* @protected
	applySelect: function(inCallback) {
		if (this.hasNode()) {
			this.node.select();
			if (inCallback) {
				inCallback();
			}
		}
	},
	/**
		Returns true if the input has keyboard focus.
	*/
	hasFocus: function() {
		if (this.hasNode()) {
			return Boolean(this.node.parentNode.querySelector(this.nodeTag +":focus"));
		}
	}
});

// on devices with focusAtPoint api, do not need special mousedown handling.
enyo.requiresWindow(function() {
	if (window.PalmSystem) {
		enyo.BasicInput.prototype.requiresDomMousedown = false;
	}
});