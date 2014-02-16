/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
/**
	_enyo.Checkbox_ implements an HTML checkbox input, with support for grouping.
*/
enyo.kind({
	name: "enyo.Checkbox",
	kind: "enyo.Input",
	classes: "enyo-checkbox",
	events: {
		//* Fires when checkbox is tapped.
		onActivate: ""
	},
	published: {
		//* Value of checkbox; true if checked
		checked: false,
		//* Group API requirement for determining selected item
		active: false,
		//* @protected
		type: "checkbox"
	},
	//* @protected
	// disable classes inherited from enyo.Input
	kindClasses: "",
	handlers: {
		onchange: "change",
		onclick: "click"
	},
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.active) {
				this.activeChanged();
			}
			this.checkedChanged();
		};
	}),
	checkedChanged: function() {
		this.setNodeProperty("checked", this.checked);
		this.setAttribute("checked", this.checked ? "checked" : "");
		this.setActive(this.checked);
	},
	// active property, and onActivate event, are part of "GroupItem" interface
	// that we support in this object
	activeChanged: function() {
		this.active = enyo.isTrue(this.active);
		this.setChecked(this.active);
		this.bubble("onActivate");
	},
	// all input type controls support 'value' property
	setValue: function(inValue) {
		this.setChecked(enyo.isTrue(inValue));
	},
	getValue: function() {
		return this.getChecked();
	},
	valueChanged: function() {
		// inherited behavior is to set "value" attribute and node-property
		// which does not apply to checkbox (uses "checked") so
		// we squelch the inherited method
	},
	change: function() {
		var nodeChecked = enyo.isTrue(this.getNodeProperty("checked"));
		this.setActive(nodeChecked);
	},
	click: function(inSender, inEvent) {
		// Various versions of IE (notably IE8) do not fire 'onchange' for
		// checkboxes, so we discern change via 'click'.
		// Note: keyboard interaction (e.g. pressing space when focused) fires
		// a click event.
		if (enyo.platform.ie <= 8) {
			this.bubble("onchange", inEvent);
		}
	}
});
