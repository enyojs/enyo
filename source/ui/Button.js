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
	_enyo.Button_ implements an HTML button, with support for grouping using
	[enyo.Group](#enyo.Group).

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Button",
	//* @protected
	kind: "enyo.ToolDecorator",
	tag: "button",
	attributes: {
		// set to button, as default is "submit" which can cause unexpected
		// problems when controls are used inside a form
		type: "button"
	},
	//* @public
	published: {
		//* When true, button is shown as disabled and does not generate tap
		//* events
		disabled: false
	},
	//* @protected
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.disabledChanged();
		};
	}),
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled);
	},
	tap: function() {
		if (this.disabled) {
			// work around for platforms like Chrome on Android or Opera that send
			// mouseup to disabled form controls
			return true;
		} else {
			this.setActive(true);
		}
	}
});
