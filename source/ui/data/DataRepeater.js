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
		childMixins: [],

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		concat: ["childMixins"],

		//*@protected
		controlParentName: "container",

		//*@protected
		handlers: {
			onModelAdded: "_model_added",
			onModelsAdded: "_models_added",
			onModelRemoved: "_model_removed",
			onModelsRemoved: "_models_removed"
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
		add: function (model) {
			var $kind = this._child_kind;
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
		_init_container: function () {
			var $container = this.get("_container");
			this.createChrome([$container]);
			this.discoverControlParent();
		},

		//*@protected
		_model_added: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			var $model = event.model;
			this.add($model);
		},

		//*@protected
		_models_added: function (sender, event) {
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
		_model_removed: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			this.remove(event.index);
		},

		//*@protected
		_models_removed: function (sender, event) {
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
		_batching_changed: enyo.observer(function (property, previous, value) {
			if (false === value) {
				var $client = this.controlParent;
				$client.render();
			}
		}, "_batching"),

		// this callback results from a call to this.findAndInstance("controller"),
		// which occurs in the _controllerChanged observer (which is implemented
		// in the ControllerSupport mixin)
		//*@protected
		controllerFindAndInstance: function(ctor, inst) {
			this.inherited(arguments);
			if (inst && inst._isController) {
				this.refresh();
			}
		},

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
