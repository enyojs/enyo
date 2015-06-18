/**
* Exports methods useful for templating strings
* @module enyo/macroize
*/
require('enyo');

var
	utils = require('./utils');

/**
* Populates a {@glossary String} template with values from an {@glossary Object}.
* Can be used with custom macro patterns.
*
* The default macro pattern is of the form `{$name}`.
*
* ```javascript
* var macroize = require('enyo/macroize');
* // returns 'My name is Barney.'
* macroize('My name is {$name}.', {name: 'Barney'});
* ```
*
* Dot notation is supported like so:
*
* ```javascript
* var info = {
* 	product_0: {
* 		name: 'Gizmo',
* 		weight: 3
* 	}
* };
*
* // returns 'Each Gizmo weighs 3 pounds.'
* macroize('Each {$product_0.name} weighs {$product_0.weight} pounds.', info);
* ```
*
* @utility
* @param {String} text - The template text in which to insert values via macro.
* @param {Object} map - The {@glossary Object} containing the data to be inserted
* into the `text`.
* @param {RegExp} [regex] - The optional pattern to use to match the entries in
* the `text`.
* @function
* @returns {String} The modified `text` value.
* @public
*/
exports = module.exports = function (text, map, regex) {
	var v, working, result = text, pattern = regex || exports.pattern;
	var fn = function(macro, name) {
		v = utils.getPath.call(map, name);
		if (v === undefined || v === null) {
			return '{$' + name + '}';
		}
		working = true;
		return v;
	};
	var prevent = 0;
	do {
		working = false;
		result = result.replace(pattern, fn);
		// if iterating more than 20 times, we assume a recursion (we should probably throw)
		if (++prevent >= 20) {
			throw('enyo/macroize: recursion too deep');
		}
	} while (working);
	return result;
};

/**
* Uses a [regular expression]{@glossary RegExp} pattern to replace tokens in a
* {@glossary String}. This is just like [macroize()]{@link module:enyo/macroize},
* except it does not support nested structures (i.e., dot notation).
*
* @utility
* @see module:enyo/macroize
* @param {String} text - The template text in which tokens will be replaced via macro.
* @param {Object} map - The {@glossary Object} containing the data to be inserted into
* the `text`.
* @param {RegExp} [regex] - The optional pattern to use to match the entries in the
* `text`.
* @returns {String} The modified `text` value.
* @public
*/
module.exports.quickReplace = function (text, map, pattern) {
	pattern = pattern || exports.pattern;
	var fn = function (token) {
		var r = map[token];
		return r || token;
	};
	return text.replace(pattern, fn);
};

/**
* A non-recursing version of [macroize()]{@link module:enyo/macroize}. This means it
* will not expand the same macro more than once in the {@glossary String}, but it
* is much more efficient than the recursing version.
*
* @utility
* @see module:enyo/macroize
* @param {String} text - The template text in which tokens will be replaced via macro.
* @param {Object} map - The {@glossary Object} containing the data to be inserted into
* the `text`.
* @param {RegExp} [regex] - The optional pattern to use to match the entries in the `text`.
* @returns {String} The modified `text` value.
* @public
*/
module.exports.quickMacroize = function(text, map, regex) {
	var v, result = text, pattern = regex || exports.pattern;
	var fn = function(macro, name) {
		if (name in map) {
			v = map[name];
		} else {
			v = utils.getPath.call(map, name);
		}
		return (v === undefined || v === null) ? '{$' + name + '}' : v;
	};
	result = result.replace(pattern, fn);
	return result;
};

/**
* The default [regular expression]{@glossary RegExp} macro pattern used by
* [macroize()]{@link module:enyo/macroize}, [macroize.quickReplace()]{@link module:enyo/macroize.quickReplace},
* and [macroize.quickMacroize()]{@link module:enyo/macroize.quickMacroize}. Matches macros of the form
* `{$name}`.
*
* @type {RegExp}
* @default '/\{\$([^{}]*)\}/g'
* @public
*/
module.exports.pattern = /\{\$([^{}]*)\}/g;
