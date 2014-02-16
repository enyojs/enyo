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
enyo.json = {
	//* @public
	/**
		Returns a JSON string for a given object, using native stringify
		routine.
		<i>inValue</i> is the Object to be converted to JSON.
		<i>inReplacer</i> is the optional value inclusion array or replacement function.
		<i>inSpace</i> is the optional number or string to use for pretty-printing whitespace.
	*/
	stringify: function(inValue, inReplacer, inSpace) {
		return JSON.stringify(inValue, inReplacer, inSpace);
	},
	/**
		Returns a JavaScript object for a given JSON string, using native stringify
		routine.
		<i>inJson</i> is the JSON string to be converted to a JavaScript object.
	*/
	parse: function(inJson, inReviver) {
		return inJson ? JSON.parse(inJson, inReviver) : null;
	}
};
