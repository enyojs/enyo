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
	_enyo.TextArea_ implements an HTML &lt;textarea&gt; element with
	cross-platform support for change events.

	For more information, see the documentation on [Text
	Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.TextArea",
	kind: "enyo.Input",
	//* @protected
	tag: "textarea",
	classes: "enyo-textarea",
	// textarea does use value attribute; needs to be kicked when rendered.
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.valueChanged();
		};
	})
});
