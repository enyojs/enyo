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
		
		//*@public
		length: enyo.computed(function () {
			return this.controller? this.controller.length: 0;
		}, {cached: false}),

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		refresh: function () {
			var $controller = this.get("controller") || [];
			
			// destroy any views we currently have rendered
			this.destroyClientControls();
			
			for (var idx = 0, len = $controller.length; idx < len; ++idx) {
				this.add($controller.at(idx));
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
			var $children = this.children || [];
			var $child = $children[index || (Math.abs($children.length - 1))];
			if ($child) {
				$child.destroy();
			}
		},
		
		//*@public
		update: function (index) {
			var $controller = this.get("controller") || [];
			var $children = this.children || [];
			var $child = $children[index];
			if ($child && $child.controller) {
				$child.controller.set("data", $controller.at(index));
			}
		},

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
			this.refresh();
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
		}, "_batching")
		
	});
	
})(enyo);