(function (enyo) {

	var isModel = enyo.isModel = function (obj) {
		return !! (obj && obj._isModel);
	};
	
	/**
		TODO:
		Relation Keys:
			key
			inverseKey
			type
			kind
			json
	*/
	var findRelations = function (proto, attributes) {
		// we will store any of the properties that are defined
		// as a relation here as our return value
		var $relations = {};
		var key, $prop;
		for (key in attributes) {
			$prop = attributes[key];
			if ($prop.relation) {
				$prop = $relations[key] = $prop.relation;
				$prop.key = $prop.key || key;
				$prop.inverseKey = $prop.inverseKey || proto.primaryKey;
				if (!$prop.kind) {
					throw "enyo.Model: relations must have a kind defined";
				}
				$prop.type = $prop.type || "one";
				if ("many" === $prop.type) {
					$prop.kind = enyo.kind({
						kind: "enyo.Collection",
						model: $prop.kind
					});
				} else if ("one" === $prop.type) {
					$prop.kind = $prop.kind || "enyo.Model";
				}
			}
		}
		return $relations;
	};
	
	var makeAttributeMap = function (attributes) {
		// we store a dual map for local and remote property matching
		var $map = {local: {}, remote: {}};
		var key, $prop;
		for (key in attributes) {
			$prop = attributes[key];
			if ("string" === typeof $prop) {
				$map.local[key] = $prop;
				$map.remote[$prop] = key;
			} else {
				$map.local[key] = $prop.key || key;
				$map.remote[$prop.key || key] = key;
			}
		}
		return $map;
	};
	
	enyo.kind.features.push(function (ctor, props) {
		if (!isModel(ctor.prototype)) {
			return;
		}
		
		// register this kind for use in a store
		enyo.models.add(ctor);
		
		// the prototype of the given constructor
		var $proto = ctor.prototype;
		
		// we break these operations for clarity
		// first we handle the attributes
		// if this is a subkind of another model the
		// attributes hash will already exist and we
		// we need to clone it for posterity
		if ($proto._attributes) {
			$proto._attributes = enyo.clone($proto._attributes);
		} else {
			// otherwise we need to create a new one to work with
			$proto._attributes = {};
		}
		// the attributes serve as a way to preserve the original
		// definition of a model
		// TODO: this is probably not necessary to keep but for debugging
		// and development is quite useful for now
		// we take the new attributes and preserve them along with
		// any current values
		enyo.mixin($proto._attributes, props.attributes);
		
		// relations are reevaluated even for subkinds to ensure that
		// if a particular known attribute was redefined we have the updated
		// relationship definition
		$proto._relations = findRelations($proto, $proto._attributes);
		
		// we update our attribute keys to mirror the changes we see in
		// our modified attributes hash
		$proto._attributeKeys = enyo.keys($proto._attributes);
		
		// we construct an attribute map for ease of converting between
		// local property names and remote property names
		$proto._attributeMap = makeAttributeMap($proto._attributes);
		
		// we are no longer concerned with the attributes property of the
		// properties for this kind and do not wish them to be added to
		// to the kind body so we remove it
		delete $proto.attributes;
	});
	
	//*@public
	/**
		enyo.kind({
			name: "My.ArtistModel",
			kind: "enyo.Model",
			attributes: {
				id: {
					key: "artist_id",
					type: "Number"
				},
				name: {
					key: "artist_name",
					type: "String"
				},
				albums: {
					relation: {
						key: "id",
						inverseKey: "artist_id",
						type: "many",
						kind: "My.AlbumModel"
					}
				}
			}
		});
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Model",
		kind: "enyo.Controller",
		attributes: null,
		url: "",
		// NEW CLEAN DIRTY ERROR LOADING COMMITTING
		status: "NEW",
		primaryKey: "id",
		events: {
			onChange: ""
		},
		
		// ...........................
		// PROTECTED PROPERTIES
		
		_isModel: true,
		_collections: null,
		_relations: null,
		_attributes: null,
		_attributeKeys: null,
		_attributeMap: null,
		_previous: null,
		_changed: null,
		_euuid: null,

		// ...........................
		// COMPUTED PROPERTIES

		query: enyo.computed(function () {
			return this.get("url") + "/" + this.get(this.primaryKey) || "";
		}),

		// ...........................
		// PUBLIC METHODS
		
		// ...........................
		// ASYNCHRONOUS METHODS
		
		commit: function (options) {
			this.exec("commit", options);
		},
		fetch: function (options) {
			if ("NEW" === this.get("status")) {
				enyo.warn(this.kindName + ": cannot fetch new record");
				return false;
			}
			this.exec("fetch", options);
		},
		destroy: function (options) {
			this.exec("destroy", options);
		},
		exec: function (action, options) {
			var $options = "object" === typeof options? options: {};
			var $success = $options.success;
			var $fail = $options.fail;
			$options.success = this.bindSafely("did" + enyo.cap(action), $success);
			$options.error = this.bindSafely("didFail", action, $fail);
			enyo.store[action](this, $options);
		},
		
		// ............................
		
		didFetch: function (fn) {
			this.log(arguments);
		},
		didCommit: function (fn) {
			this.log(arguments);
		},
		didDestroy: function (fn) {
			this.log(arguments);
		},
		didFail: function (action, fn) {
			this.log(arguments);
		},
		
		raw: function (useLocalKeys) {
			var $attrs = this._attributes;
			var $ret = enyo.only(this._attributeKeys, this);
			var $rels = this._relations;
			var key, $rel, $kind, prop;
			if (!useLocalKeys) {
				$ret = enyo.remap(this._attributeMap.local, $ret);
			}
			for (key in $rels) {
				$rel = $rels[key];
				if (!enyo.exists(this[key])) {
					continue;
				}
				if ($rel.json) {
					// the key that will be included in the parent (return) raw
					// data hash
					prop = $rel.json.key || key; // if there wasn't a key designated
					$ret[prop] = this[key].raw(useLocalKeys);
				}
			}
			return $ret;
		},
		toJSON: function () {
			return enyo.json.stringify(this.raw());
		},
		isAttribute: function (prop) {
			return !!~enyo.indexOf(prop, this._attributeKeys);
		},
		isRelation: function (prop) {
			return !! (prop in this._relations);
		},
		previous: function (prop) {
			return this._previous[prop];
		},
		set: function (prop, val) {
			if ("object" === typeof prop) {
				this.silence();
				this.stopNotifications();
				for (var key in prop) {
					this.set(key, prop[key]);
				}
				this.startNotifications();
				this.unsilence();
				this._flushChanges();
				return this;
			} else if (this.isRelation(prop)) {
				return this.setRelation(prop, val);
			} else {
				return this.inherited(arguments);
			}
		},
		setRelation: function (prop, val) {
			var $relations = this._relations;
			var $rel = $relations[rel];
			// TODO: need to implement this functionality
		},
		constructor: function (values) {
			// first we have a local reference to the original values
			// passed into the object (if there were any)
			var $values = values;
			// we set the object to undefined so we can allow the constructor
			// chain to continue without automatically applying these values
			// to this record
			values = undefined;
			// allow the remaining constructors to complete their initialization
			this.inherited(arguments);
			// initialize our variables
			this._collections = [];
			this._previous = {};
			this._changed = {};
			// now we can safely apply any initial values if we have some
			// note that if there are values we are no longer a new status
			// we are clean because we aren't empty
			if ($values) {
				// if we have a defined structure we adhere to the structure
				// otherwise we implicitly derive the structure but no special
				// relationships
				if (this._attributeKeys.length) {
					enyo.mixin(this, enyo.only(this._attributeKeys, $values));
				} else {
					this._attributeKeys = enyo.keys($values);
					enyo.mixin(this, $values);
				}
				// we set our status to clean because we have values
				this.status = "CLEAN";
				// set our previous up initially
				this._previous = enyo.only(this._attributeKeys, this);
			}
			this.url = this.url || this.kindName.replace(/^(.*)\./, "").toLowerCase();
		},
		
		create: function () {
			this.inherited(arguments);
			enyo.store.init(this);
			this._initRelations();
		},

		// ...........................
		// PROTECTED METHODS

		_addCollection: function (col) {
			if (!~enyo.indexOf(col, this._collections)) {
				this._collections.push(col);
				this.addDispatchTarget(col);
			}
		},
		//*@protected
		/**
			Will initialize the relationships for any data that was
			handed to the model when it was created.
		*/
		_initRelations: function () {
			var $relations = this._relations;
			var $rel, key;
			for (key in $relations) {
				$rel = $relations[key];
				if (enyo.exists(this[key])) {
					this._createRelation(key, $rel);
				}
			}
		},
		_createRelation: function (key, relation) {
			var type = relation.type;
			var $kind = "string" === typeof relation.kind? (relation.kind = enyo.getPath(relation.kind)): relation.kind;
			var $data = this.get(key);
			var $prop = this[key] = new $kind($data);
			// TODO: this is setting us up for direct notification
			// inside relationships as opposed to letting the store
			// dispatch these events...probably better, could get tricky
			$prop.addDispatchTarget(this);
		},

		_removeCollection: function (col) {
			var idx = enyo.indexOf(col, this._collections);
			if (!!~idx) {
				this._collections.splice(idx, 1);
				this.removeDispatchTarget(col);
			}
		},

		_flushChanges: function () {
			if (!this._silenced) {
				this.doChange({
					previous: this._previous,
					changed: this._changed
				});
				this._changed = {};
			}
		},

		// ...........................
		// OBSERVERS

		_attributeSpy: enyo.observer(function (prop, prev, val) {
			if (this.isAttribute(prop) || this.isRelation(prop)) {
				this._previous[prop] = prev;
				this._changed[prop] = val;
				this.status = "DIRTY";
			}
		}, "*")

	});

})(enyo);