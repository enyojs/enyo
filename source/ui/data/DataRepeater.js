(function (enyo, scope) {
	/**
	* `enyo.DataRepeater` iterates over the items in an {@link enyo.Collection} to repeatedly render
	* and synchronize records (instances of {@link enyo.Model}) to its own children. For any record
	* in the [collection]{@link enyo.Collection}, a new child will be rendered in this repeater. If 
	* the record is destroyed, the child will be destroyed. These [controls]{@link enyo.Control} 
	* will automatically update when the properties on the underlying record are modified if they 
	* have been bound using bindings (see {@link enyo.Binding}).
	*
	* @ui
	* @class enyo.DataRepeater
	* @public
	*/
	enyo.kind(
		/** @lends enyo.DataRepeater.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.DataRepeater',

		/**
		* Set this to `true` to allow selection support to be enabled. Note that selection stores a 
		* reference to the [model]{@link enyo.Model} that is selected.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		selection: true,

		/**
		* Set this to `true` to allow multiple children to be selected simultaneously. If this is 
		* `true`, then the [_selection_]{@link enyo.DataRepeater#selection} property will be set to 
		* `true` even if it has previously been set to `false`.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		multipleSelection: false,
		
		/**
		* Set this to `true` to allow group-selection behavior such that only one child can be
		* selected at a time and once one is selected, it cannot be deselected (via user input).
		* The child can still be deselected via the _selection api methods_. Note that this will set
		* {@link enyo.DataRepeater#multipleSelection} to `false`.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		groupSelection: false,

		/**
		* This class will be applied to the [repeater]{@link enyo.DataRepeater} when 
		* [_selection_]{@link enyo.DataRepeater#selection} is enabled. If 
		* [_multipleSelection_]{@link enyo.DataRepeater#multipleSelection} is `true`, this class 
		* will also be applied.
		*
		* @type {String}
		* @default 'selection-enabled'
		* @public
		*/
		selectionClass: 'selection-enabled',

		/**
		* This class will be applied to the [repeater]{@link enyo.DataRepeater} when 
		* [_multipleSelection_]{@link enyo.DataRepeater#multipleSelection} is `true`. If 
		* [_multipleSelection_]{@link enyo.DataRepeater#multipleSelection} is `true`, the 
		* [_selectionClass_]{@link enyo.DataRepeater#selectionClass} will also be applied.
		*
		* @type {String}
		* @default 'multiple-selection-enabled'
		* @public
		*/
		multipleSelectionClass: 'multiple-selection-enabled',

		/**
		* In cases where selection should be detected from the state of the 
		* [model]{@link enyo.Model}, this property should be set to the property that the 
		* [repeater]{@link enyo.DataRepeater} should observe for changes. If the 
		* [model]{@link enyo.Model} changes, the [repeater]{@link enyo.DataRepeater} will reflect 
		* the change without needing to interact directly with the [model]{@link enyo.Model}. Note 
		* that this property must be a part of the [model's]{@link enyo.Model} schema or its changes
		* will not be detected properly.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		selectionProperty: '',

		/**
		* Set this to a space-delimited string of [events]{@glossary event} or an 
		* [array]{@glossary Array} that can trigger the selection of a particular child. To 
		* prevent selection entirely see [_selection_]{@link enyo.DataRepeater#selection} and set it
		* to `false`.
		*
		* @type {String}
		* @default 'ontap'
		* @public
		*/
		selectionEvents: 'ontap',

		/**
		* Use this [hash]{@glossary Object} to define _defaultBindingProperties_ for _all_ 
		* children (even children of children) of this [repeater]{@link enyo.DataRepeater}. This can
		* eliminate the need to write the same paths many times. You can also use any 
		* [binding]{@link enyo.Binding} macros. Any property defined here will be superseded by the 
		* same property if defined for an individual [binding]{@link enyo.Binding}.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		childBindingDefaults: null,
		
		/**
		* @private
		*/
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

		/**
		* @method
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				this._selection = [];
				// we need to initialize our selectionEvents array
				var se = this.selectionEvents;
				this.selectionEvents = (typeof se == 'string'? se.split(' '): se);
				// we need to pre-bind these methods so they can easily be added
				// and removed as listeners later
				var h = this._handlers = enyo.clone(this._handlers);
				for (var e in h) {
					h[e] = this.bindSafely(h[e]);
				}
				if (this.groupSelection === true) this.multipleSelection = false;
				sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.collectionChanged();
				this.selectionChanged();
			};
		}),

		/**
		* @private
		*/
		observers: [
			{method: 'selectionChanged', path: 'multipleSelection'}
		],
		
		/**
		* @private
		*/
		groupSelectionChanged: function () {
			if (this.groupSelection) this.set('multipleSelection', false); 
		},
		
		/**
		* @private
		*/
		multipleSelectionChanged: function (was) {
			if (was && !this.multipleSelection) {
				if (this._selection.length > 1) {
					this.deselectAll();
				}
			} else if (this.multipleSelection) {
				this.set('groupSelection', false);
			}
		},

		/**
		* @private
		*/
		selectionChanged: function () {
			this.addRemoveClass(this.selectionClass, this.selection);
			this.addRemoveClass(this.multipleSelectionClass, this.multipleSelection && this.selection);
		},

		/**
		* Destroys any existing children in the [repeater]{@link enyo.DataRepeater} and creates all 
		* new children based on the current [data]{@link enyo.Repeater#data}.
		*
		* @public
		*/
		reset: function () {
			// use the facaded dataset because this could be any
			// collection of records
			var dd = this.get('data');
			// destroy the client controls we might already have
			this.destroyClientControls();
			// and now we create new ones for each new record we have
			for (var i=0, r; (r=dd.at(i)); ++i) {
				this.add(r, i);
			}
			this.hasReset = true;
		},
		/**
		* Refreshes each [control]{@link enyo.Control} in the dataset.
		*
		* @param {Boolean} immediate - If `true`, _refresh_ will occur immediately, otherwise it will
		*	be queued up as a job.
		* @public
		*/
		refresh: function (immediate) {
			if (!this.hasReset) { return this.reset(); }
			var refresh = this.bindSafely(function () {
				var dd = this.get('data'),
					cc = this.getClientControls();
				for (var i=0, c, d; (d=dd.at(i)); ++i) {
					c = cc[i];
					if (c) {
						c.set('model', d);
					} else {
						this.add(d, i);
					}
				}
				this.prune();
			});

			// refresh is used as the event handler for
			// collection resets so checking for truthy isn't
			// enough. it must be true.
			if(immediate === true) {
				refresh();
			} else {
				this.startJob('refreshing', refresh, 16);
			}
		},
		
		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				if (this.collection && this.collection.length) {
					this.reset();
				}
				this.hasRendered = true;
			};
		}),

		/**
		* Add a [record]{@link enyo.Model} at a particular index.
		* 
		* @param {enyo.Model} rec - The [record]{@link enyo.Model} to add.
		* @param {Number} idx - The index at which the [record]{@link enyo.Model} should be added.
		* @public
		*/
		add: function (rec, idx) {
			var c = this.createComponent({model: rec, index: idx});
			if (this.generated && !this.batching) {
				c.render();
			}
		},

		/**
		* Remove the [record]{@link enyo.Model} at a particular index.
		*
		* @param {Number} idx - The index of the [record]{@link enyo.Model} to be removed.
		* @public
		*/
		remove: function (idx) {
			var controls = this.getClientControls()
				, control;
			
			control = controls[idx];
			
			if (control) control.destroy();
		},

		/**
		* Removes any [controls]{@link enyo.Control} that are outside the boundaries of the 
		* [data]{@link enyo.DataRepeater#data} [collection]{@link enyo.Collection} for the 
		* {@link enyo.DataRepeater}.
		* 
		* @public
		*/
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

		/**
		* @private
		*/
		initContainer: function () {
			var ops = this.get('containerOptions'),
				nom = ops.name || (ops.name = this.containerName);
			this.createChrome([ops]);
			this.discoverControlParent();
			if (nom != this.containerName) {
				this.$[this.containerName] = this.$[nom];
			}
		},

		/**
		* @private
		*/
		handlers: {
			onSelected: 'childSelected',
			onDeselected: 'childDeselected'
		},

		/**
		* @private
		*/
		_handlers: {
			add: 'modelsAdded',
			remove: 'modelsRemoved',
			reset: 'refresh',
			sort: 'refresh',
			filter: 'refresh'
		},

		/**
		* @private
		*/
		collectionChanged: function (p) {
			var c = this.collection;
			if (typeof c == 'string') {
				c = this.collection = enyo.getPath(c);
			}
			if (c) {
				this.initCollection(c, p);
			}
		},

		/**
		* @private
		*/
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

		/**
		* @private
		*/
		modelsAdded: function (sender, e, props) {
			if (sender === this.collection) this.refresh();
		},

		/**
		* @private
		*/
		modelsRemoved: function (sender, e, props) {
			var selected = this._selection,
				orig,
				model,
				idx,
				len = selected && selected.length,
				i = props.models.length - 1;
			
			if (sender === this.collection) {
				
				// ensure that the models aren't currently selected
				if (len) {
					
					// unfortunately we need to make a copy to preserve what the original was
					// so we can pass it with the notification if any of these are deselected
					orig = selected.slice();
					
					// clearly we won't need to continue checking if we need to remove the model from
					// the selection if there aren't any more in there
					for (; (model = props.models[i]) && selected.length; --i) {
						idx = selected.indexOf(model);
						if (idx > -1) selected.splice(idx, 1);
					}
					
					if (len != selected.length) {
						if (this.selection) {
							if (this.multipleSelection) this.notify('selected', orig, selected);
							else this.notify('selected', orig[0], selected[0] || null);
						}
					}
				}
				
				this.refresh();
			}
		},

		/**
		* @private
		*/
		batchingChanged: function (prev, val) {
			if (this.generated && false === val) {
				this.$[this.containerName].render();
				this.refresh(true);
			}
		},

		/**
		* Calls [_childForIndex()_]{@link enyo.DataRepeater#getChildForIndex}, leaving for posterity.
		*
		* @param {Number} idx - The index of the child to retrieve.
		* @returns {enyo.Control|undefined} Returns the [control]{@link enyo.Control} or `undefined`
		*	if it could not be found or the index of out of bounds.
		* @public
		*/
		getChildForIndex: function (idx) {
			return this.childForIndex(idx);
		},

		/**
		* Attempts to return the [control]{@link enyo.Control} representation at a particular index.
		*
		* @param {Number} idx - The index of the child to retrieve.
		* @returns {enyo.Control|undefined} Returns the [control]{@link enyo.Control} or `undefined`
		*	if it could not be found or the index of out of bounds.
		* @public
		*/
		childForIndex: function (idx) {
			return this.$.container.children[idx];
		},

		/**
		* Retrieve the data associated with the {@link enyo.DataRepeater}.
		*
		* @returns {enyo.Collection} The {@link enyo.Collection} that comprises the _data_.
		* @public
		*/
		data: function () {
			return this.collection;
		},

		/**
		* Consolidates selection logic and allows for deselection of a [model]{@link enyo.Model} 
		* that has already been removed from the [collection]{@link enyo.Collection}.
		* 
		* @private
		*/
		_select: function (idx, model, select) {
			if (!this.selection) {
				return;
			}

			var c = this.getChildForIndex(idx),
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
				c.set('selected', select);
			}
			if (this.selectionProperty && model) {
				(s=this.selectionProperty) && model.set(s, select);
			}
			this.notifyObservers('selected');
		},

		/**
		* Selects the item at the given index.
		*
		* @param {Number} idx - The index of the item to select.
		* @public
		*/
		select: function (idx) {
			this._select(idx, this.collection.at(idx), true);
		},

		/**
		* De-selects the item at the given index.
		*
		* @param {Number} idx - The index of the item to deselect.
		* @public
		*/
		deselect: function (idx) {
			this._select(idx, this.collection.at(idx), false);
		},

		/**
		* Determines whether a [model]{@link enyo.Model} is currently selected.
		*
		* @param {enyo.Model} model - The model whose selection status is to be determined.
		* @returns {Boolean} Returns `true` if the given [model]{@link enyo.Model} is selected,
		*	`false` otherwise.
		* @public
		*/
		isSelected: function (model) {
			return !!~enyo.indexOf(model, this._selection);
		},

		/**
		* Selects all items (if [_multipleSelection_]{@link enyo.DataRepeater#multipleSelection} is 
		* `true`).
		*
		* @public
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
		* De-selects all items.
		*
		* @public
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
		* A computed property that returns the currently selected [model]{@link enyo.Model} (if 
		* [_multipleSelection_]{@link enyo.DataRepeater#multipleSelection} is `false`), or an 
		* immutable [array]{@glossary Array} of all currently selected 
		* [models]{@link enyo.Model} (if it is `true`).
		*
		* @public
		*/
		selected: function() {
			// to ensure that bindings will clear properly according to their api
			return (this.multipleSelection ? this._selection : this._selection[0]) || null;
		},

		/**
		* @private
		*/
		dataChanged: function () {
			if (this.collection && this.hasRendered) {
				this.reset();
			}
		},

		/**
		* @private
		*/
		computed: [
			{method: 'selected'},
			{method: 'data', path: ['controller', 'collection']}
		],

		/**
		* @private
		*/
		noDefer: true,

		/**
		* @private
		*/
		childMixins: [enyo.RepeaterChildSupport],

		/**
		* @private
		*/
		controlParentName: 'container',

		/**
		* @private
		*/
		containerName: 'container',

		/**
		* @private
		*/
		containerOptions: {name: 'container', classes: 'enyo-fill enyo-data-repeater-container'},

		/**
		* @private
		*/
		batching: false,

		/**
		* @private
		*/
		_selection: null
	});

	/**
	* @static
	* @private
	*/
	enyo.DataRepeater.concat = function (ctor, props) {
		var p = ctor.prototype || ctor;
		if (props.childMixins) {
			p.childMixins = (p.childMixins? enyo.merge(p.childMixins, props.childMixins): props.childMixins.slice());
			delete props.childMixins;
		}
	};

})(enyo, this);
