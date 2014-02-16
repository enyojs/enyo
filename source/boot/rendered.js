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
/*
 * Enables registering callbacks, to be called when
 * renderInto is done rendering root component tree
 */

//*@protected
(function (enyo) {

	var callbacks = [];

	var invoke = function (root) {
		for (var n=0, a; (a = callbacks[n]); n++) {
			a[0].apply(a[1] || enyo.global, [root]);
		}
	};

	//*@public
	//* Registers callback to be called every time a root is rendered by calling
	//* enyo.Control.renderInto() or
	enyo.rendered = function (f, context) {
		callbacks.push([f, context]);
	};

	//*@protected
	//* Adds control to enyo.roots; Called from enyo.Control.renderInto()
	enyo.addToRoots = function(root) {
		if (!enyo.exists(enyo.roots)) {
			enyo.roots = [ root ];
		} else {
			enyo.roots.push(root);
		}

		var rendered = root.rendered;
		root.rendered = function() {
			rendered.apply(root, []);
			invoke(root);
		};
		root._isRoot = true;
	};

})(enyo);
