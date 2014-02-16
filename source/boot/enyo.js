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
(function() {
	// enyo can use information from the script tag that loads this bootstrap file
	var thisScript = "enyo.js";

	/* global enyo:true */
	enyo = window.enyo || {options: {}};

	enyo.locateScript = function(inName) {
		var scripts = document.getElementsByTagName("script");
		for (var i=scripts.length-1, s, src, l=inName.length; (i>=0) && (s=scripts[i]); i--) {
			if (!s.located) {
				src = s.getAttribute("src") || "";
				if (src.slice(-l) == inName) {
					s.located = true;
					return {path: src.slice(0, Math.max(0, src.lastIndexOf("/"))), node: s};
				}
			}
		}
	};

	enyo.args = enyo.args || {};

	var tag = enyo.locateScript(thisScript);
	if (tag) {
		// infer the framework path from the document, unless the user has specified one explicitly
		enyo.args.root = (enyo.args.root || tag.path).replace("/source", "");
		// all attributes of the bootstrap script tag become enyo.args
		for (var i=0, al = tag.node.attributes.length, it; (i < al) && (it = tag.node.attributes.item(i)); i++) {
			enyo.args[it.nodeName] = it.value;
		}
	}
})();