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
