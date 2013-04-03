//*@public
/**
	_enyo.ArrayController_ is a kind designed to mimic the behavior and API
	of an ECMAScript 5 Array object, with additional functionality specific
	to _enyo.Object_. By default, the object will index its values so they
	are accessible via the bracket-accessor operators. On large datasets,
	we recommend setting the _store_ property to _true_ and only using the
	_at_ accessor method. This is	not necessary for small-to-medium
	datasets.
*/
enyo.kind({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.ArrayController",

	//*@public
	kind: "enyo.Controller",

	//*@public
	/**
		The current length of the array. Setting the length directly
		will have undesirable effects.
	*/
	length: 0,

	//*@public
	/**
		Computed property representing the array structure of the
		underlying data. This is an immutable array, as changes will
		not modify the array structure of this controller.
	*/
	data: enyo.computed(function (data) {
		if (data) {
			return this.reset(data);
		}
		var store = [];
		var idx = 0;
		var len = this.length;
		for (; idx < len; ++idx) {
			store[idx] = this[idx];
		}
		return store;
	}, "length", {cached: true}),

	// ...........................
	// PROTECTED PROPERTIES

	//*@protected
	_init_values: null,

	// ...........................
	// PUBLIC METHODS

	// ...........................
	// ECMAScript 5 API METHODS

	//*@public
	push: function (/* _values_ */) {
		var values = arguments;
		var pos = this.length;
		var num = values.length + pos;
		var idx = 0;
		var changeset = {};
		var len = this.length;
		if (num) {
			for (; pos < num; ++pos, ++idx) {
				changeset[pos] = this[pos] = values[idx];
			}
			this.length = num;
			this.notifyObservers("length", len, this.length);
			this.dispatchBubble("didadd", {values: changeset}, this);
			return this.length;
		}
		return 0;
	},

	//*@public
	pop: function () {
		if (this.length) {
			var pos = this.length - 1;
			var val = this[pos];
			var changeset = {};
			// remove the value at that position
			delete this[pos];
			// reset our length value
			this.length = pos;
			// set our changeset parameter
			changeset[pos] = val;
			this.notifyObservers("length", pos + 1, pos);
			this.dispatchBubble("didremove", {values: changeset}, this);
			return val;
		}
	},

	//*@public
	shift: function () {
		if (this.length) {
			var val = this[0];
			var idx = 1;
			var len = this.length;
			var changeset = {};
			// unfortunately, we have to reindex the entire dataset,
			// but even for large ones, this is a generic reassignment
			// with little overhead
			for (; idx < len; ++idx) {
				this[idx-1] = this[idx];
			}
			// delete the reference to the previous last element
			delete this[len-1];
			// update the length
			this.length = len - 1;
			// set the changeset
			changeset[0] = val;
			this.notifyObservers("length", len, this.length);
			this.dispatchBubble("didremove", {values: changeset}, this);
			return val;
		}
	},

	//*@public
	unshift: function (/* _values_ */) {
		if (arguments.length) {
			var len = this.length;
			// intially we assign this to the last element's index
			var idx = len - 1;
			var pos = arguments.length;
			var nix = idx + pos;
			var changeset = {};
			// unfortunately, as with unshift, we have some reindexing
			// to do, but regardless of the number of elements we're
			// unshifting, we can do this in a single pass. we start
			// from the end so we don't have to copy twice for every
			// element in the dataset.
			for (; nix >= pos; --nix, --idx) {
				this[nix] = this[idx];
			}
			// now we start from the beginning since we should have just
			// enough space to add these new elements
			for (idx = 0; idx < pos; ++idx) {
				changeset[idx] = this[idx] = arguments[idx];
			}
			// update our length
			this.length = len + arguments.length;
			this.notifyObservers("length", len, this.length);
			this.dispatchBubble("didadd", {values: changeset}, this);
			return this.length;
		}
	},

	//*@public
	indexOf: function (value, pos) {
		return enyo.indexOf(value, this.get("data"), pos);
	},

	//*@public
	lastIndexOf: function (value, pos) {
		return enyo.lastIndexOf(value, this.get("data"), pos);
	},

	//*@public
	splice: function (index, many /* _values_ */) {
		var elements = enyo.toArray(arguments).slice(2);
		var elen = elements.length;
		var len = this.length;
		var max = len - 1;
		var ret = [];
		var changeset = {added: {len:0}, removed: {len:0}, changed: {len:0}};
		var pos = 0;
		var idx;
		var count;
		var range;
		var diff;
		index = index < 0? 0: index >= len? len: index;
		many = many && !isNaN(many) && many + index <= len? many: 0;
		if (many) {
			range = index + many - elen;
			// special note here about the count variable, the minus one is because
			// the index in this operation is included in the many variable amount
			for (idx = index, count = index + many - 1 ; idx <= count; ++idx, ++pos) {
				ret[pos] = this[idx];
				if (elen && elen >= many) {
					changeset.changed[idx] = this[idx];
					changeset.changed.len++;
				} else if (elen && elen < many && idx < range) {
					changeset.changed[idx] = this[idx];
					changeset.changed.len++;
				}
				changeset.removed[idx] = this[idx];
				changeset.removed.len++;
			}
		}
		if (elen && elen > many) {
			diff = elen - many;
			pos = max;
			for (; pos >= index && pos < len; --pos) {
				this[pos+diff] = this[pos];
			}
			this.length += diff;
		} else {
			diff = many - (elen? elen: 0);
			pos = index + many;
			for (; pos < len; ++pos) {
				this[pos-diff] = this[pos];
				changeset.changed[pos-diff] = this[pos-diff];
				changeset.changed.len++;
			}
			idx = this.length -= diff;
			for (; idx < len; ++idx) {
				delete this[idx];
			}
		}
		if (elen) {
			pos = 0;
			idx = index;
			diff = many? many > elen? many - elen: elen - many: 0;
			for (; pos < elen; ++idx, ++pos) {
				this[idx] = elements[pos];
				if (len && idx < len) {
					changeset.changed[idx] = this[idx];
					changeset.changed.len++;
				}
				if (!len || (diff && pos >= diff) || !many) {
					changeset.added[len+pos-diff] = this[len+pos-diff];
					changeset.added.len++;
				}
			}
		}

		// we have to update the length if it changed to notify observers/bindings
		// to data that it may have been updated or bindings to data will still
		// have the cached dataset
		if (len !== this.length) {
			this.notifyObservers("length", len, this.length);
		}

		if (changeset.removed.len) {
			delete changeset.removed.len;
			this.dispatchBubble("didremove", {values: changeset.removed}, this);
		}
		if (changeset.added.len) {
			delete changeset.added.len;
			this.dispatchBubble("didadd", {values: changeset.added}, this);
		}
		if (changeset.changed.len) {
			delete changeset.changed.len;
			this.dispatchBubble("didchange", {values: changeset.changed}, this);
		}
		return ret;
	},

	//*@public
	join: function (separator) {
		this.get("data").join(separator);
	},

	//*@public
	map: function (fn, context) {
		return enyo.map(this.get("data"), fn, context);
	},

	//*@public
	filter: function (fn, context) {
		return enyo.filter(this.get("data"), fn, context);
	},

	// ...........................
	// CUSTOM API

	//*@public
	add: function (value, at) {
		value = value && ("length" in value)? value: [value];
		var len = this.length;
		var idx = at && !isNaN(at) && at >= 0 && at < len? at: len;
		var args = [idx, 0].concat(value);
		this.splice.apply(this, args);
	},

	//*@public
	remove: function (value, index) {
		var changeset;
		var idx;
		var len;
		var start = 0;
		if (value instanceof Array) {
			changeset = {removed: {}, changed: {}};
			idx = 0;
			len = value.length;
			this.silence();
			this.stopNotifications(true);
			for (; idx < len; ++idx) {
				index = this.indexOf(value[idx]);
				if (index < start) {
					start = index;
				}
				changeset.removed[idx] = value[idx];
				this.remove(value[idx], index);
			}
			// we need to create the changeset for any indices below
			// the lowest index we found
			for (idx = start, len = this.length; idx < len; ++idx) {
				changeset.changed[idx] = this[idx];
			}
			this.unsilence();
			this.startNotifications(true);
			this.dispatchBubble("didremove", {values: changeset.removed}, this);
			this.dispatchBubble("didchange", {values: changeset.changed}, this);
		} else {
			idx = !isNaN(index)? index: this.indexOf(value);
			if (!!~idx) {
				this.splice(idx, 1);
			}
		}
	},

	//*@public
	reset: function (values) {
		this.silence();
		this.stopNotifications(true);
		if (values) {
			this.splice.apply(this, [0, this.length].concat(values));
		} else {
			this.splice(0, this.length);
		}
		this.unsilence();
		this.startNotifications(true);
		this.dispatchBubble("didreset", {values: this}, this);
	},

	swap: function (index, to) {
		var changeset = {};
		var from = this[index];
		var target = this[to];
		changeset[index] = this[index] = target;
		changeset[to] = this[to] = from;
		this.dispatchBubble("didchange", {values: changeset}, this);
	},

	//*@public
	move: function (index, to) {
		var val;
		var len = this.length;
		var max = len - 1;
		// normalize the index to be the min or max
		index = index < 0? 0: index >= len? max: index;
		// same for the target index
		to = to < 0? 0: to >= len? max: to;
		// if they are the same, there's nothing to do
		if (index === to) {
			return;
		}
		// capture the value at index so we can set the new
		// index to the appropriate value
		val = this[index];
		// we need to make sure any operations we do don't
		// communicate the changes until we are done
		// and because this is a special operation we have our
		// own event they must respond to not a global change
		// although this will cause the cache to need to
		// be updated
		this.silence();
		this.stopNotifications(true);
		// if the index is the top, we don't want to do extra
		// calculations or indexing on this step, so just
		// pop the value
		if (index === max) {
			this.pop();
		}
		// unfortunately, we need to splice the value out of the
		// dataset before reinserting it at the appropriate spot
		else {
			this.splice(index, 1);
		}
		// we turn events and notifications back on here so that
		// they can produce the final changeset appropriately
		this.unsilence();
		this.startNotifications(true);
		// re-add the value at the correct index
		this.splice(to, 0, val);
	},

	//*@public
	contains: function (value) {
		return !!~enyo.indexOf(this.get("data"), value)? true: false;
	},

	//*@public
	at: function (index) {
		return this[index];
	},

	//*@public
	/**
		Detects the presence of value in the array. Accepts an iterator
		and an optional context for that iterator to be called under. Will
		break and return if the iterator returns a truthy value; otherwise,
		it will return false. On a truthy value, it returns the value.
	*/
	find: function (fn, context) {
		var idx = 0;
		var len = this.length;
		var val;
		for (; idx < len; ++idx) {
			val = this.at(idx);
			if (fn.call(context || this, val)) {
				return val;
			}
		}
		return false;
	},

	//*@public
	/**
		Because the controller cannot detect reassignment to its indices
		(e.g., myvar[3] = "touché"), you can do your own custom assignment
		and call this method once when you are finished--if the changes
		need to be acknowledged in order for notifications and events to
		be sent. Otherwise, there is no need to call the method.

		There are two ways to call this method--without any parameters, or
		with an array (or a hash whose keys will be used as an array) of
		the indices that have changed. When called without parameters, it
		will search for changed indices against its cached dataset using
		direct comparison (or if a _comparator_ method exists on the
		controller, it will use the result from that to determine equality).
		On larger datasets, this is less than ideal; if possible, keep track
		of the indices that have changed and pass them to this method so it
		can simply update its cache and notify observers and listeners of
		the changes to those indices.

		It is important to note that, when using native JavaScript objects,
		the reference is shared. If a property on the hash is directly set
		and this method is called, it will be impossible to detect changes
		since the references in the comparator are the same. If your data is
		contained in native objects, it is imperative that you provide the
		indices that have changed to this method. The alternative (and
		recommended) approach is to use an _enyo.ObjectController_ to proxy
		the data of the underlying hash and use that controller's setter and
		getter, which will automatically trigger the correct updates when a
		property has changed.
	*/
	changed: function (changed) {
		var changeset = {};
		var pos = 0;
		var len;
		var indices;
		var idx;
		var dataset;
		var val;
		if (changed) {
			if (changed instanceof Array) {
				indices = changed.slice();
			} else {
				indices = enyo.keys(changed);
			}
		} else {
			indices = [];
			len = this.length;
			dataset = this.get("data");
			for (; pos < len; ++pos) {
				val = dataset[pos];
				if (!this.comparator(this[pos], val)) {
					changeset[pos] = this[pos];
					indices.push(pos);
				}
			}
		}
		if (!indices.length) {
			return;
		}
		for (len = indices.length; pos < len; ++pos) {
			idx = indices[pos];
			changeset[idx] = this[idx];
		}
		this.dispatchBubble("didchange", {values: changeset}, this);
	},

	//*@public
	comparator: function (left, right) {
		return left === right;
	},

	// ...........................
	// PROTECTED METHODS

	//*@protected
	create: function () {
		this.inherited(arguments);
		// if there were values waiting to be initialized, they couldn't
		// have been until now
		if (this._init_values) {
			this.add.call(this, this._init_values);
			this._init_values = null;
		}
	},

	//*@protected
	constructor: function () {
		this.inherited(arguments);
		// if there were any properties passed to the constructor, we
		// automatically add them to the array
		if (arguments.length) {
			var init = [];
			var idx = 0;
			var len = arguments.length;
			for (; idx < len; ++idx) {
				if (arguments[idx] instanceof Array) {
					init = init.concat(arguments[idx]);
				}
			}
			this._init_values = init;
		}
	}

});
