(function (enyo) {
	
	//*@public
	/**
	*/
	enyo.kind({
		
		// ...........................
		// PUBLIC PROPERTIES
		
		//*@public
		name: "enyo.DataRepeater",

		//*@public
		kind: "enyo.View",
		
		//*@public
		/**
		*/
		loading: false,
		
		//*@public
		/**
		*/
		childControllerKind: "enyo.ObjectController",
		
		//*@public
		/**
		*/
		childMixins: [],
		
		// ...........................
		// PROTECTED PROPERTIES
		
		//*@protected
		controlParentName: "container",
		
		//*@protected
		handlers: {
			onIndexChanged: "_index_changed",
			onItemAdded: "_item_added",
			onItemsAdded: "_items_added",
			onItemRemoved: "_item_removed",
			onItemsRemoved: "_items_removed"
		},
		
		//*@protected
		bindings: [{
			from: ".controller.fetching",
			to: ".loading",
			kind: "enyo.BooleanOnlyBinding"
		}, {
			from: ".controller.length",
			to: ".length"
		}, {
			from: ".controller.data",
			to: ".data"
		}],
		
		//*@protected
		_child_kind: null,
		
		//*@protected
		_batching: false,
		
		//*@protected
		_container: {
			name: "container",
			kind: "enyo.View",
			classes: "enyo-fill enyo-data-repeater-container",
		},
		
		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		refresh: function () {
			var $data = this.get("data");
			// destroy any views we currently have rendered
			this.destroyClientControls();
			if (!$data) {
				return;
			}
			for (var idx = 0, len = $data.length; idx < len; ++idx) {
				this.add($data[idx]);
			}
		},
		
		//*@public
		add: function (item) {
			var $kind = this._child_kind;
			var $child = this.createComponent({kind: $kind});
			var batching = this._batching;
			$child.controller.set("data", item);
			if (!batching) $child.render();
		},
		
		//*@public
		remove: function (index) {
			var $children = this.get("_children");
			var $child = $children[index || (Math.abs($children.length - 1))];
			if ($child) {
				$child.destroy();
			}
		},
		
		//*@public
		update: function (index) {
			var $data = this.get("data");
			var $children = this.get("_children");
			var $child = $children[index];
			if (!$data || !$child || !$child.controller) {
				return;
			}
			$child.controller.set("data", $data[index]);
		},
		
		//*@public
		prune: function () {
			var $children = this.get("_children");
			var len = this.length;
			var $extra = $children.slice(len);
			for (var idx = 0; idx < $extra.length; ++idx) {
				$extra[idx].destroy();
			}
		},
		
		// ...........................
		// COMPUTED PROPERTIES
		
		//*@protected
		_children: enyo.computed(function () {
			return this.controlParent? this.controlParent.children: this.children;
		}, {cached: false}),

		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		initComponents: function () {
			// we need to find the child definition and prepare it for
			// use in our repeater including adding auto binding support
			var $components = this.kindComponents || this.components || [];
			var $owner = this.components? this.owner: this;
			this._child_kind = enyo.kind({
				// tag: null, // no need for the extra container
				// TODO: it should be possible to use the above line but for
				// now it is causing far too many issues
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport"].concat(this.childMixins || []),
				components: $components,
				defaultKind: this.defaultKind || "enyo.View",
				defaultProps: {owner: $owner}
			});
			this._init_container();
		},
		
		//*@protected
		adjustComponentProps: function (props) {
			this.inherited(arguments);
			if (!((props.kind && props.kind.controller) || props.controller)) {
				if (props.name !== this.controlParentName) {
					props.controller = this.childControllerKind;
				}
			}
		},
		
		//*@protected
		create: function () {
			this.inherited(arguments);
		},
		
		//*@protected
		_init_container: function () {
			var $container = this.get("_container");
			this.createChrome([$container]);
			this.discoverControlParent();
		},
		
		//*@protected
		_index_changed: function (sender, event) {
			var idx = event.index;
			this.update(idx);
		},
		
		//*@protected
		_item_added: function (sender, event) {
			var $item = event.item;
			this.add($item);
		},
		
		//*@protected
		_items_added: function (sender, event) {
			var $items = event.items;
			var idx = 0;
			var len = $items.length;
			this.set("_batching", true);
			for (; idx < len; ++idx) {
				this.add($items[idx]);
			}
			this.set("_batching", false);
		},
		
		//*@protected
		_item_removed: function (sender, event) {
			this.remove();
		},
		
		//*@protected
		_items_removed: function (sender, event) {
			var $items = event.items;
			var idx = 0;
			var len = $items.length;
			for (; idx < len; ++idx) {
				this.remove();
			}
		},

		// ...........................
		// OBSERVERS
		
		//*@protected
		_batching_changed: enyo.observer(function (property, previous, value) {
			if (false === value) {
				var $client = this.controlParent;
				$client.render();
			}
		}, "_batching"),
		
		//*@protected
		_controller_changed: enyo.observer(function (property, previous, value) {
			if (value && (value instanceof enyo.Enumerable)) {
				this.refresh();
			}
			if (this._controller_changed._inherited) {
				this.inherited(arguments);
			}
		}, "controller"),
		
		//*@protected
		_length_changed: enyo.observer(function (property, previous, value) {
			if (!isNaN(previous) && !isNaN(value)) {
				if (previous > value) {
					this.prune();
				}
			}
		}, "length")
		
	});
	
})(enyo);