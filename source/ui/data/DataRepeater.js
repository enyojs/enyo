//*@public
/**
		_enyo.DataRepeater_ iterates over the items in an
		[enyo.Collection](#enyo.Collection) to repeatedly render and
		synchronize  records (instances of [enyo.Model](#enyo.Model)) to its
		own children. For any record in the collection, a new child will be
		rendered in this repeater. If  the record is destroyed, the child will
		be destroyed. These controls will automatically update when the
		properties on the underlying record are modified if they have been
		bound using bindings (see [enyo.Binding](#enyo.Binding)).
*/
enyo.kind({
	name: "enyo.DataRepeater",
	//*@public
	/**
		Set this to true to allow selection support to be enabled. Default
		is true for single-selection. Note that selection stores a reference to
		the model that is selected.
	*/
	selection: true,
	/**
		Set this to true to allow multiple children to be selected simultaneously.
		If this is true, then the _selection_ property will be set to true even if
		it has previously been set to false.
	*/
	multipleSelection: false,
	/**
		This class will be applied to the repeater when _selection_ is enabled.
		The default is _selection-enabled_. If _multipleSelection_ is true, this
		class will also be applied.
	*/
	selectionClass: "selection-enabled",
	/**
		This class will be applied to the repeater when _multipleSelection_ is
		true. The default is _multiple-selection-enabled_. If _multipleSelection_
		is true, the _selectionClass_ will also be applied.
	*/
	multipleSelectionClass: "multiple-selection-enabled",
	/**
		In cases where selection should be detected from the state of the model,
		this property should be set to the property that the repeater should
		observe for changes. If the model changes, the repeater will reflect the
		change without needing to interact directly with the model. Note that this
		property must be a part of the model's schema or its changes will not be
		detected properly.
	*/
	selectionProperty: "",
	/**
		Set this to a space-delimited string of events or an array that can trigger
		the selection of a particular child. By default it is simply the _ontap_
		event. To prevent selection entirely see _selection_ and set it to `false`.
	*/
	selectionEvents: "ontap",
	/**
		Use this hash to define _defaultBindingProperties_ for _all_ children
		(even children of children) of this repeater. This can be eliminate the
		need to write the same paths many times. You can also use any	binding
		macros. Any property defined here will be superseded by the same property if
		defined for an individual binding.
	*/
	childBindingDefaults: null,
	//*@protected
	initComponents: function () {
		this.initContainer();
		var c = this.kindComponents || this.components || [],
			o = this.getInstanceOwner(),
			d = this.defaultProps? enyo.clone(this.defaultProps): (this.defaultProps = {});
		// ensure that children know who their binding owner is
		d.bindingTransformOwner = this;
		d.bindingDefaults = this.childBindingDefaults;
		if (c) {
			// if there are multiple components in the components block they will become nested
			// children of the default kind set for the repeater
			if (c.length > 1) {
				d.components = c;
			}
			// if there is only one child, the properties will be the default kind of the repeater
			else {
				enyo.mixin(d, c[0]);
			}
			d.repeater = this;
			d.owner = o;
			d.mixins = d.mixins? d.mixins.concat(this.childMixins): this.childMixins;
		}
	},
	constructor: enyo.inherit(function (sup) {
		return function () {
			this._selection = [];
			// we need to initialize our selectionEvents array
			var se = this.selectionEvents;
			this.selectionEvents = (typeof se == "string"? se.split(" "): se);
			// we need to pre-bind these methods so they can easily be added
			// and removed as listeners later
			var h = this._handlers = enyo.clone(this._handlers);
			for (var e in h) {
				h[e] = this.bindSafely(h[e]);
			}
			sup.apply(this, arguments);
		};
	}),
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.collectionChanged();
			this.selectionChanged();
		};
	}),
	observers: {
		selectionChanged: ["multipleSelection"]
	},
	selectionChanged: function () {
		this.addRemoveClass(this.selectionClass, this.selection);
		this.addRemoveClass(this.multipleSelectionClass, this.multipleSelection && this.selection);
	},
	//*@public
	/**
		Destroys any existing children in the repeater and creates all new children
		based on the current data.
	*/
	reset: function () {
		// use the facaded dataset because this could be any
		// collection of records
		var dd = this.get("data");
		// destroy the client controls we might already have
		this.destroyClientControls();
		// and now we create new ones for each new record we have
		for (var i=0, r; (r=dd.at(i)); ++i) {
			this.add(r, i);
		}
		this.hasReset = true;
	},
	/**
		Refreshes each control in the dataset.
	*/
	refresh: function () {
		if (!this.hasReset) { return this.reset(); }
		this.startJob("refreshing", function () {
			var dd = this.get("data"),
				cc = this.getClientControls();
			for (var i=0, c, d; (d=dd.at(i)); ++i) {
				c = cc[i];
				if (c) {
					c.set("model", d);
				} else {
					this.add(d, i);
				}
			}
			this.prune();
		}, 16);
	},
	//*@protected
	rendered: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.collection && this.collection.length) {
				this.reset();
			}
			this.hasRendered = true;
		};
	}),
	add: function (rec, i) {
		var c = this.createComponent({model: rec, index: i});
		if (this.generated && !this.batching) {
			c.render();
		}
	},
	remove: function (i) {
		var g = this.getClientControls(),
			c = g[i || (Math.abs(g.length-1))];
		if (c) {
			c.destroy();
		}
	},
	prune: function () {
		var g = this.getClientControls()
			, len = (this.collection? this.collection.length: 0)
			, x;
		if (g.length > len) {
			x = g.slice(len);
			for (var i=0, c; (c=x[i]); ++i) {
				c.destroy();
			}
		}
	},
	initContainer: function () {
		var ops = this.get("containerOptions"),
			nom = ops.name || (ops.name = this.containerName);
		this.createChrome([ops]);
		this.discoverControlParent();
		if (nom != this.containerName) {
			this.$[this.containerName] = this.$[nom];
		}
	},
	handlers: {onSelected: "childSelected", onDeselected: "childDeselected"},
	_handlers: {add: "modelsAdded", remove: "modelsRemoved", reset: "refresh"},
	collectionChanged: function (p) {
		var c = this.collection;
		if (typeof c == "string") {
			c = this.collection = enyo.getPath(c);
		}
		if (c) {
			this.initCollection(c, p);
		}
	},
	initCollection: function (c, p) {
		var e;
		if (c && c.addListener) {
			for (e in this._handlers) {
				c.addListener(e, this._handlers[e]);
			}
		}
		if (p && p.removeListener) {
			for (e in this._handlers) {
				p.removeListener(e, this._handlers[e]);
			}
		}
	},
	modelsAdded: function (c, e, props) {
		if (c == this.collection) {
			this.set("batching", true);
			// note that these are indices when being added so they can be lazily
			// instantiated
			for (var i=0, r; (!isNaN(r=props.records[i])); ++i) {
				this.add(c.at(r), r);
			}
			this.set("batching", false);
		}
	},
	modelsRemoved: function (c, e, props) {
		if (c == this.collection) {
			// unfortunately we need to remove these in reverse order
			var idxs = enyo.keys(props.records);
			for (var i=idxs.length-1, idx; (idx=idxs[i]); --i) {
				this.remove(idx);
				this._select(idx, props.records[idx], false);
			}
		}
	},
	batchingChanged: function (prev, val) {
		if (this.generated && false === val) {
			this.$[this.containerName].render();
		}
	},
	/**
		Calls _childForIndex()_, leaving for posterity.
	*/
	getChildForIndex: function (i) {
		return this.childForIndex(i);
	},
	/**
		Attempts to return the control representation of the data index.
		Returns the control or undefined if it could not be found or the
		index of out of bounds.
	*/
	childForIndex: function (i) {
		return this.$.container.children[i];		
	},
	data: function () {
		return this.collection;
	},
	/**
		Consolidates selection logic and allows for deselection of a model
		that has already been removed from the collection
	*/
	_select: function (index, model, select) {
		if (!this.selection) {
			return;
		}

		var c = this.getChildForIndex(index),
			s = this._selection,
			i = enyo.indexOf(model, s);

		if (select) {
			if(i == -1) {
				if(!this.multipleSelection) {
					while (s.length) {
						i = this.collection.indexOf(s.pop());
						this.deselect(i);
					}
				}

				s.push(model);
			}
		} else {
			if(i >= 0) {
				s.splice(i, 1);
			}
		}

		if (c) {
			c.set("selected", select);
		}
		if (this.selectionProperty && model) {
			(s=this.selectionProperty) && model.set(s, select);
		}
		this.notifyObservers("selected");
	},
	//*@public
	/**
		Selects the item at the given index.
	*/
	select: function (index) {
		this._select(index, this.collection.at(index), true);
	},
	/**
		De-selects the item at the given index.
	*/
	deselect: function (index) {
		this._select(index, this.collection.at(index), false);
	},
	/**
		Returns a Boolean indicating whether the given model is selected.
	*/
	isSelected: function (model) {
		return !!~enyo.indexOf(model, this._selection);
	},
	/**
		Selects all items (if _multipleSelection_ is true).
	*/
	selectAll: function () {
		if (this.multipleSelection) {
			this.stopNotifications();
			var s = this._selection
				, len = this.collection? this.collection.length: 0;
			s.length = 0;
			for (var i=0; i<len; ++i) {
				this.select(i);
			}
			this.startNotifications();
		}
	},
	/**
		De-selects all items.
	*/
	deselectAll: function () {
		if (this.selection) {
			this.stopNotifications();
			var s = this._selection, m, i;
			while (s.length) {
				m = s.pop();
				i = this.collection.indexOf(m);
				this.deselect(i);
			}
			this.startNotifications();
		}
	},
	/**
		A computed property that returns the currently selected model
		(if _multipleSelection_ is false), or an immutable array of all currently
		selected models (if it is true).
	*/
	selected: function() {
		// to ensure that bindings will clear properly according to their api
		return (this.multipleSelection ? this._selection : this._selection[0]) || null;
	},
	//*@protected
	dataChanged: function () {
		if (this.collection && this.hasRendered) {
			this.reset();
		}
	},
	computed: {selected: [], data: ["controller", "collection"]},
	noDefer: true,
	childMixins: [enyo.RepeaterChildSupport],
	controlParentName: "container",
	containerName: "container",
	containerOptions: {name: "container", classes: "enyo-fill enyo-data-repeater-container"},
	batching: false,
	_selection: null
});

enyo.DataRepeater.concat = function (ctor, props) {
	var p = ctor.prototype || ctor;
	if (props.childMixins) {
		p.childMixins = (p.childMixins? enyo.merge(p.childMixins, props.childMixins): props.childMixins.slice());
		delete props.childMixins;
	}
};
