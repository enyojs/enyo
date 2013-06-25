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
		childMixins: [],
		
		//*@public
		concat: ["childMixins"],

		//*@public
		controlParentName: "container",
		
		//*@public
		containerOptions: {
			name: "container",
			kind: "enyo.View",
			classes: "enyo-fill enyo-data-repeater-container",
		},

		//*@public
		handlers: {
			onModelAdded: "_modelAdded",
			onModelsAdded: "_modelsAdded",
			onModelRemoved: "_modelRemoved",
			onModelsRemoved: "_modelsRemoved"
		},

		//*@public
		bindings: [
			{from: ".controller.length", to: ".length"},
			{from: ".controller.data", to: ".data"}
		],

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_childKind: null,

		//*@protected
		_batching: false,

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		initComponents: function () {
			// we need to find the child definition and prepare it for
			// use in our repeater including adding auto binding support
			var $components = this.kindComponents || this.components || [];
			var $owner = this.components? this.owner: this;
			this._childKind = enyo.kind({
				// tag: null, // no need for the extra container
				// TODO: it should be possible to use the above line but for
				// now it is causing far too many issues
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport"].concat(this.childMixins || []),
				components: $components,
				defaultKind: this.defaultKind || "enyo.View",
				defaultProps: {owner: $owner}
			});
			this._initContainer();
		},

		//*@public
		controllerFindAndInstance: function(ctor, inst) {
			this.inherited(arguments);
			if (inst && inst._isController) {
				this.refresh();
			}
		},

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
		add: function (model) {
			var $kind = this._childKind;
			var $child = this.createComponent({kind: $kind});
			var batching = this._batching;
			$child.set("model", model);
			if (!batching) {
				$child.render();
			}
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
			$child.set("model", $data[index]);
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
		_initContainer: function () {
			var $container = this.get("containerOptions");
			this.createChrome([$container]);
			this.discoverControlParent();
		},

		//*@protected
		_modelAdded: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			var $model = event.model;
			this.add($model);
		},

		//*@protected
		_modelsAdded: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			this.set("_batching", true);
			enyo.forEach(event.models, function (info) {
				this.add(info.model);
			}, this);
			this.set("_batching", false);
		},

		//*@protected
		_modelRemoved: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			this.remove(event.index);
		},

		//*@protected
		_modelsRemoved: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			enyo.forEach(event.models, function (info) {
				this.remove(info.index);
			}, this);
		},

		// ...........................
		// OBSERVERS

		//*@protected
		_batchingChanged: function (prev, val) {
			if (false === val) {
				var $client = this.controlParent;
				$client.render();
			}
		},

		//*@protected
		_lengthChanged: enyo.observer(function (prop, prev, val) {
			if (!isNaN(prev) && !isNaN(val)) {
				if (prev > val) {
					this.prune();
				}
			}
		}, "length")

	});

})(enyo);
