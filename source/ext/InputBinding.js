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
//*@public
/**
	_enyo.InputBinding_ is a binding designed to have its source or target be an
	_input_ with an optional _placeholder_ value. This keeps the input from
	showing _undefined_ when there is no content, as the _placeholder_ value will
	then be used for display.
*/
enyo.kind({
	name: "enyo.InputBinding",
	kind: enyo.Binding,
	/**
		The direction priority for the placeholder text so it is not propagated when
		an empty string should be.
	*/
	placeholderDirection: "source",
	oneWay: false,
	//*@protected
	transform: function (value, direction, binding) {
		if (value) { return value; }
		var pd = binding.placeholderDirection,
			ph = binding[pd].placeholder || "";
		return ph;
	}
});
