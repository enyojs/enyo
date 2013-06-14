// INVERSEKEY AND RELATIONKEY IMPLEMENTATIONS
// FILTER?
// SETTER TYPE VALIDATION

(function (enyo) {
	
	//*@public
	/**
		Takes an object and returns a _Boolean_ `true` | `false` if
		the object is a `enyo.Model` or _subkind_.
	*/
	enyo.isModel = function (obj) {
		return !! (obj && obj._isModel);
	};
	//*@protected
	var isModel = enyo.isModel;
	
	//*@protected
	var relationInitializers = {
		autoFetch: function (props) {
			if (!enyo.exists(props.autoFetch)) {
				props.autoFetch = true;
			}
		},
		model: function (props) {
			if (!enyo.exists(props.model)) {
				props.model = enyo.Model || "enyo.Model";
			}
		},
		inCommit: function (props) {
			if (!enyo.exists(props.inCommit)) {
				props.inCommit = false;
			}
		},
		isOwner: function (props) {
			if (!enyo.exists(props.isOwner)) {
				props.isOwner = true;
			}
			if (props.isOwner) {
				props.inCommit = false;
			}
		},
		inverseKey: function (props) {
			// nop for now
		},
		relationKey: function (props) {
			if (!enyo.exists(props.relationKey)) {
				props.relationKey = "id";
			}
		},
		collection: function (props) {
			if (props._kind == "toOne") {
				return;
			}
			if (!enyo.exists(props.collection)) {
				// we know there exists a model property because it
				// will have already been normalized
				props.collection = enyo.kind({kind: "enyo.Collection", model: props.model});
			}
		}
	};
	
	//*@protected
	var relationKeys = enyo.keys(relationInitializers);
	
	//*@protected
	/**
		Handles common features of all relations.
	*/
	var initRelation = function (props) {
		var $props = props;
		enyo.forEach(relationKeys, function (fn) {
			relationInitializers[fn]($props);
		});
	};
	
	//*@protected
	/**
		Executed in the context of the record.
	*/
	var toOneHandler = function (key, rel, val) {
		var $rec = this[key];
		if (!$rec) {
			if (rel.isOwner) {
				// if the incoming value is an object it is assumed to be
				// the property hash for the record so we create it in-place
				if (enyo.isObject(val)) {
					val[rel.inverseKey] = this;
					$rec = this[key] = new rel.model(val);
				} else {
					// have to ask the store to look for the correct record first
					// just to be sure if it is already loaded that we use the same
					// one
					var $opts = {};
					$opts.params = {};
					$opts.params[rel.inverseKey] = this[rel.relationKey];
					// note this is a synchronous call because we don't supply
					// the asynchronous success/error callbacks and that it is
					// only a local find when executed this way
					$rec = enyo.store.findOne(rel.model, $opts);
					// if it isn't local already we create it and if its auto
					// fetchable call fetch
					if (!$rec) {
						$rec = new rel.model();
						$rec.set(rel.inverseKey, this);
						if (rel.autoFetch) {
							$rec.fetch();
						}
					}
				}
			} else {
				// we aren't the owner but should have been handed the actual
				// record
				$rec = this[key] = val;
				// since we aren't the owner of the relation we register the owner
				// as a listener to our events
				this.addDispatchTarget($rec);
			}
		} else {
			// well, this would be odd but possible
			if (rel.isOwner) {
				$rec.didFetch({}, val);
			}
		}
	};
	
	//*@protected
	/**
		Executed in the context of the record.
	*/
	var toManyHandler = function (key, rel, val) {
		var $rec = this[key];
		if (!$rec) {
			$rec = this[key] = new rel.collection(val);
			$rec.addDispatchTarget(this);
			if (rel.inverseKey) {
				$rec.set(rel.inverseKey, this);
			}
		} else {
			if (val) {
				$rec.didFetch({}, val);
			}
		}
	};
	
	// TODO: For the resulting documentation to properly organize these methods
	// in association with enyo.Model we need a more powerful documentation tool,
	// enyo.Model.toOne, etc. is ugly and cumbersome.
	
	//*@public
	enyo.toOne = function (props) {
		var $props = props;
		$props._kind = "toOne";
		$props.handler = $props.handler || toOneHandler;
		initRelation($props);
		return $props;
	};
	
	//*@public
	enyo.toMany = function (props) {
		var $props = props;
		$props._kind = "toMany";
		$props.handler = $props.handler || toManyHandler;
		initRelation($props);
		return $props;
	};
	
	//*@protected
	var defaultFormatter = function (key, value, action, payload) {
		return value;
	};
	
	//*@protected
	var defaultTypeWrangler = function (attr, key, value, action, payload) {
		if (attr && attr.type && value) {
			if (enyo.isString(attr.type)) {
				// it hasn't been resolved yet
				var $type = enyo.getPath(attr.type);
				if ($type) {
					attr.type = $type;
				}
			}
			switch (action) {
			case "fetch":
				// TODO: All native types need to be added here and tested
				if (attr.type) {
					if (String === attr.type) {
						if (!enyo.isString(value)) {
							value = value && value.toString? value.toString(): String(value);
						}
					} else if (!(value && value instanceof attr.type)) {
						value = new attr.type(value);
					}
				}
				return value;
				break;
				
				
				return value instanceof attr.type? value: new attr.type(value);
				break;
			case "commit":
				return value.toString();
				break;
			}
		}
		return value;
	};
	
	//*@protected
	var initializers = {
		/**
			If there is a remote key defined we track that and create
			the appropriate map between the local and remote key.
		*/
		remoteKey: function (proto, key, attr) {
			var $keys = proto._remoteKeys || (proto._remoteKeys = {});
			if (attr.remoteKey) {
				// so now we know it is a remote key and we have mapped
				// it to the local key
				$keys[attr.remoteKey] = key;
			}
		},
		type: function (proto, key, attr) {
			// nop for now
		},
		/**
			If a typeWrangler was defined as a string it is attempted to be
			grabbed from the prototype for the model and if it isn't found
			it uses the default.
		*/
		typeWrangler: function (proto, key, attr) {
			if (attr.typeWrangler) {
				if (enyo.isString(attr.typeWrangler)) {
					if (!(attr.typeWrangler = proto[attr.typeWrangler])) {
						enyo.warn("enyo.Model: attribute defined with typeWrangler but no " +
							"such typeWrangler was found on the model prototype -> " +
							key + " in " + proto.kindName + ", using the default typeWrangler");
					}
				}
				if (enyo.isFunction(attr.typeWrangler)) {
					return;
				}
			}
			// we bind it including the attribute has so it can attempt to use
			// the type if it was defined even if it couldn't be resolved at this
			// moment during initialization
			attr.typeWrangler = enyo.bind(null, defaultTypeWrangler, attr);
		},
		/**
			If a formatter was defined as a string it is attempted to be
			grabbed from the prototype for the model and if it isn't found
			it uses the default.
		*/
		formatter: function (proto, key, attr) {
			if (attr.formatter) {
				if (enyo.isString(attr.formatter)) {
					if (!(attr.formatter = proto[attr.formatter])) {
						enyo.warn("enyo.Model: attribute defined with formatter but no " +
							"such formatter was found on the model prototype -> " + 
							key + " in " + proto.kindName + ", using the default formatter");
					}
				}
				if (enyo.isFunction(attr.formatter)) {
					return;
				}
			}
			// nothing we can do really except assume that the structure it
			// is coming in as will be correct
			attr.formatter = defaultFormatter;
		},
		/**
			If a relation is define for the attribute we go ahead and
			initialize what we can.
		*/
		relation: function (proto, key, attr) {
			var $rels = proto._relations || (proto._relations = {});
			if (attr.relation) {
				$rels[key] = attr.relation;
			}
		}
	};
	
	//*@protected
	/**
		The known and available attribute keys. All others are ignored (removed).
		A separate initializer is setup for each of these for modularity and
		(internal) extensibility in the future and easier debugging. They are retrieved
		from the initializers because for future options you only need to add the
		entry there and it will automatically be handled.
	*/
	var attributeKeys = enyo.keys(initializers);
	
	//*@protected
	var normalizeAttribute = function (proto, key, attr, attrs) {
		var $prop = attrs[key] = attr? enyo.only(attributeKeys, attr): {};
		var $proto = proto;
		var $key = key;
		enyo.forEach(attributeKeys, function (fn) {
			initializers[fn]($proto, $key, $prop);
		});
	};
	
	//*@protected
	/**
		Attempt to do all the necessary setup on our attributes in a single
		pass as opposed to several. Actions are broken up for modularity,
		better (internal) extensibility in the future and easier debugging.
	*/
	var normalizeAttributes = function (proto, attrs) {
		var key, $prop, $keys = proto._attributeKeys || (proto._attributeKeys = []);
		for (key in attrs) {
			if (!~enyo.indexOf(key, $keys)) {
				$keys.push(key);
			}
			$prop = attrs[key] = enyo.clone(attrs[key]);
			normalizeAttribute(proto, key, $prop, attrs);
		}
	};
	
	//*@protected

	var initRelations = function () {
		var key, $rel, $rels = this._relations;
		// since at load time we can't be sure all the constructors are loaded
		// we have to resort to doing this at runtime
		// TODO: Could register relations globally and have an enyo.ready call
		// that does this once for all known relations as opposed to every time
		// a new model is instanced (with potentially far more overhead)
		for (key in $rels) {
			$rel = $rels[key];
			if ($rel.isOwner) {
				switch ($rel._kind) {
				case "toOne":
					if (!enyo.isFunction($rel.model)) {
						$rel.model = enyo.getPath($rel.model);
					}
					break;
				case "toMany":
					if (!enyo.isFunction($rel.collection)) {
						$rel.collection = enyo.getPath($rel.collection);
					}
				}
			}
		}
	};

	//*@protected
	/**
		Used to breakdown a destroyed model.
	*/
	var breakdown = function (model) {
		// make sure to cleanup any relations that have been instantiated
		// for this where this model was the owner
		var key, $rel, $rels = model._relations;
		for (key in $rels) {
			$rel = $rels[key];
			if ($rel.isOwner) {
				// TODO: For now we just orphan related models but possibly
				// should determine a way to know whether or not to destroy
				// them as well
				// if the relation is a toMany than we should be looking at
				// a collection, since we own that collection, we destroy it
				// but the models will still exist
				if ($rel._kind == "toMany") {
					if (model[key]) {
						model[key].destroy();
						model[key] = null;
					}
				} else if ($rel._kind == "toOne") {
					if (model[key]) {
						model[key].removeDispatchTarget(model);
						if ($rel.inverseKey) {
							model[key].set($rel.inverseKey, null);
						}
						model[key] = null;
					}
				}
			}
		}
		// continue the normal component breakdown for the rest
		enyo.Component.prototype.destroy.call(model);
	};
	
	//*@protected
	/**
		Initialization routine for all model kinds. Is abstracted such that
		it can be used at run-time for generic models that are attempting to
		infer their own schemas from the data structure they encountered.
	*/
	var initModel = function (proto, props) {
		
		// the prototype of the given constructor
		var $proto = proto;
		
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
		if ($proto._relations) {
			$proto._relations = enyo.clone($proto._relations);
		}
		// the attributes serve as a way to preserve the original
		// definition of a model

		// we take the new attributes and preserve them along with
		// any current values
		enyo.mixin($proto._attributes, props);
		// we want to make sure that no matter what we include the primaryKey
		// attribute in the payload
		if (!($proto.primaryKey in $proto._attributes)) {
			$proto._attributes[$proto.primaryKey] = null;
		}
		// do the rest of the initialization routine on the attributes
		// in a single pass
		normalizeAttributes($proto, $proto._attributes);
	};
	
	//*@protected
	/**
		When the kind features chain comes across a model definition
		we need to ensure some setup so we do this once for any kind
		up front to be as efficient as possible.
	*/
	enyo.kind.features.push(function (ctor, props) {
		if (!isModel(ctor.prototype)) {
			return;
		}
		var $proto = ctor.prototype;
		// register this kind for use in a store
		enyo.models.add(ctor);
		initModel($proto, props.attributes || {});
		
		// we are no longer concerned with the attributes property of the
		// properties for this kind and do not wish them to be added to
		// to the kind body so we remove it
		delete $proto.attributes;
		
		// we attempt to auto generate a url when necessary
		$proto.url = props.url || !$proto.noUrl? ($proto.name || $proto.kindName)
			.replace(/^(.*)\./g, "").toLowerCase(): "";
	});
	
	//*@protected
	/**
		Without interfering with the construction chain we need to register
		the record with the store. This cannot be done in during the construction
		chain.
	*/
	enyo.kind.postConstructors.push(function () {
		if (this._isModel && enyo.store) {
			enyo.store.initModel(this);
		}
	});
	
	//*@public
	/**
		The `enyo.Model` _kind_ is, simply put, an object that represents data. It
		has a common and abstracted interface by which it can be manipulated and 
		persisted. When used in tandem with `enyo.Collection`, `enyo.Store` and 
		`enyo.Source` it can be a well defined _schema_ representing _objects_ that
		in your application. They can have an implicitly derived _schema_ or an
		explicitly defined _schema_ according to your implementation and needs.

		[see enyo.Collection](#), [see enyo.Store](#), [see enyo.Source](#)

		__TODO: There are still features left to be implemented including but not
		limited to the following:__

		- field validators and error state based on validation
		- optional change set commits (as opposed to every field on every commit)

		A _schema_ for a _model_ is defined in the `attributes` property (hash). Each
		key in this hash represents an entry in the _schema_. It can be better defined
		with the _schema options_ hash. The _schema options_ are a set of properties
		that describe what this _attribute_ is and in some cases how it interacts with
		other _schemas_. The _schema options_ are as follows.

		###### [Schema Options](id:schema-options)

		##### [`remoteKey`](id:remoteKey) - _String_

		In cases where the remote key should differ from the local key specify what
		`remoteKey` should be paired with this local key. For example, a table in your
		RDBMS _schema_ has an index _my\_table\_id_ but this is ugly to reference in
		the client-side source you could map it to (local) _id_.

		```
		attributes: {
			// the key defined here is the attribute we want to use
			// in our application
			id: {
				// here we tell it that the remote key it should use
				// for this will have a different name
				remoteKey: "my_table_id"
			}
		}
		```

		##### [`type`](id:type) - _Function (object constructor)_ or _String_

		When specified the incoming data will be passed to the constructor defined by
		`type`. For example, if your database provides a value representing a date but
		is stored as a unix timestamp you could specify `Date` as the `type` and when
		data is retrieved/added for this key it will be passed to the _constructor_ for
		the named `type`. This can be a constructor or a String placeholder for a
		constructor. __If the `type` is a custom _kind_ that requires a different
		approach than simply supplying the data to the constructor you will have to use
		the `typeWrangler` ([see typeWrangler](#typeWrangler)) _schema option_ for type
		coercion.__ Note that if a `type` is specified but coercion fails the _model_
		will __throw an exception__. This should be used, however, as a sanity check and
		can help to find flaws in _schema_ designs both local and remote.

		```
		attributes: {
			published: {
				type: Date
			}
		}
		```

		##### [`typeWrangler`](id:typeWrangler) - _Function_ or _String_

		The `typeWrangler` _method_ or _string_ representing the _method_ on the model
		that, when supplied, will be called once for incoming data (via _fetch_) and
		once for outgoing data (via _commit_). The _function_ takes the form of
		`function (key, value, action, payload)` where `key` is the _attribute_ in the
		schema, `value` is the entry for that `key` in the `payload`, `action` is either
		"fetch" or "commit" where "fetch" means the data was just fetched and "commit"
		means the _model_ is about to be committed, and `payload` is the mutable full
		dataset (coming in or going out). In both cases it should return the data as
		the _correct type_ (specified by the `type` [[see type](#type)] _schema option_).

		##### [`formatter`](id:formatter) - _Function_ or _String_

		There are times when incoming data will be in an unuseful form or structure.
		While both the `enyo.Source` and `enyo.Model` _kinds_ supply a generic `filter`
		method for incoming data it may be more convenient to supply a separate data
		formatter for a particular key. For example, if you're using a public API to
		retrieve data and it comes back as a nested object in which the useful data is
		deeper in the tree you can use this method to retrieve just the useful
		information. This _method_ must return the desired data. If a `typeWrangler`
		([see typeWrangler](#typeWrangler)) exists for this _schema option_ the
		`formatter` will be executed first. The _function_ takes the form of
		`function (key, value, action, payload)` where `key` is the _attribute_ in the
		schema, `value` is the entry for that `key` in the `payload`, `action` is either
		"fetch" or "commit" where "fetch" means the data was just fetched and "commit"
		means the _model_ is about to be committed, and `payload` is the mutable full
		dataset (coming in or going out).


		##### [`relation`](id:relation) - _Enum_
		__TODO: While relationships do function their API is considered _volatile_ until
		a future release and is only partially implemented in `enyo.Store`
		([see enyo.Store](#))__

		Relationships between _schemas_ (_models_) are defined by supplying _relation
		options_ to the 2 known _relation types_ `enyo.toOne` and `enyo.toMany` and. 
		These _relation types_ are _functions_ that take your
		_relation options_ and uses them to create an appropriate handler for the
		`relation`.

		```
		attributes: {
			comments: {
				relation: enyo.toMany({
					autoFetch: true,
					inCommit: false,
					inverseKey: "ownerId",
					relationKey: "id",
					model: "models.CommentModel"
				})
			}
		}
		```

		###### [Relation Options](id:relation-options)

		##### [`autoFetch`](id:autoFetch) - _Boolean_ (_default_ `true`)

		When the incoming data for a particular relation is not included in the
		_dataset_ and needs to be _fetched_ separately this _relation option_ can be set
		to `true`. Sometimes it is desirable to post-pone fetching of a relationship
		that is not included in the original payload and in such a case `autoFetch`
		should be explicitly set to `false`.

		##### [`model`](id:model) - _Function (object constructor)_ or _String_

		This is the _constructor_ or _string_ placeholder for the _constructor_ of the
		_kind_ of _model_ to use for this `relation`. If `model` is supplied for a
		`enyo.toMany` `relation` it will use a generic `enyo.Collection` with that
		_model kind_. If there is a custom _collection kind_ use the `collection`
		_relation option_ instead ([see collection](#collection)).

		##### [`collection`](id:collection) - _Function (object constructor)_ or _String_

		This is only used in `enyo.toMany` `relations` and will be
		ignored in `enyo.toOne` `relations`. This _constructor_ or _string_ placeholder
		for the _constructor_ of the _kind_ of _collection_ to use for this `relation`.
		When supplying a custom _collection kind_ that _kind_ is responsible for being
		configured to use the correct _model kind_.

		##### [`inCommit`](id:inCommit) - _Boolean_ (_default_ `false`)

		Set this _relation option_ to `true` to include this `relation` in a _commit_
		payload to the _source_.

		##### [`inverseKey`](id:inverseKey) - _String_

		The _string_ representing the key on the _related model_ to designate the
		relationship (if any).

		##### [`relationKey`](id:relationKey) - _String_ (_default_ `id`)

		The _string_ representing the key on this _model_ to compare against the
		`inverseKey` (if any).

		##### [`isOwner`](id:isOwner) - _Boolean_ (_default_ `true`)

		In relationships it is important to indicate the _direction of ownership_. The owner
		of the relationship will receive the _change events_ of the related _model(s)_
		whereas the _non-owner_ will not. Also note that if `isOwner` is `false` the `inCommit`
		option is automatically set to `false` even if it was explicitly set to `true`.

		---

		Here is an example of a completed `enyo.Model` _schema_ definition. __Note not
		every _model_ needs to use all of these features.__

		```
		enyo.kind({
			name: "models.Contact",
			kind: "enyo.Model",
			attributes: {
				// example of mapping a remote key to a different
				// local key and ensuring it will be a number
				id: {
					remoteKey: "contact_id",
					type: Number
				},
				// example of creating a meta attribute that has no
				// direct mapping to a remote key but combines two
				// remote keys into one locally and on commit will
				// parse them and map them back to the appropriate
				// structure in the payload, here we have the method
				// inlined in the attributes definition but it could
				// have been a string representing the name of the method
				// on the model itself
				name: {
					type: String,
					typeWrangler: function (field, action, payload) {
						switch (action) {
						case "fetch":
							// field will be undefined on fetch since it
							// isn't represented by an actual key in the dataset
							return payload.first_name + " " + payload.last_name;
							break;
						case "commit":
							// field will be defined as whatever the last state
							// of the record was in the application but returning
							// a value in this case will do nothing since we don't
							// have an actual key called "name" so we modify the
							// payload directly
							var parts = field.split(" ");
							payload.first_name = parts[0];
							payload.last_name = parts[1];
							// returning anything won't do anything but for clarity
							// we return undefined
							return undefined;
							break;
						}
					}
				},
				// example of a meta association with other data that is
				// not included in the payload associated with a fetch request
				// and note we do not wish to include it in a payload for commit
				// on this model
				comments: {
					relation: enyo.toMany({
						autoFetch: true,
						inCommit: false,
						inverseKey: "ownerId",
						relationKey: "id",
						model: "models.CommentModel"
					})
				}
			}
		});
		```
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.Model",
		
		//*@public
		kind: "enyo.MultipleDispatchComponent",
		
		//*@public
		/**
			The defined _schema_ for this _model_. If not defined the _model_
			will attempt to infer the the _schema_ from the structure of the
			data passed to it at construction time.
		*/
		attributes: null,
		
		//*@public
		/**
			The `defaults` hash of _default_ values to be supplied to the
			_model_ upon instantiation. When no _schema_ (attributes) are
			explicitly defined but defaults are, the _schema_ will be infered
			from these properties. They are in key-value pairs where the value
			can be of any type, even a _function_. If the _value_ is a _function_
			it will be executed during initialization under the context of the
			model (as `this`) and is expected to __return the default value for
			its assigned property__.
		*/
		defaults: null,
		
		//*@public
		/**
			The `url` property is a static root for this particular _model_.
			In a system with a simple REST backend with a 1 to 1 mapping of
			client _model_ to backend server/service the `url` could be of
			the form `/models/artist`. It can also be used in more complex
			scenarios. Note this `url` property is appended to the _domain url_
			genereated by the `enyo.Source` for the `enyo.Store` of the current
			application. If the `noUrl` property is set to `false` and no
			`url` is specified it will be automatically generated based on the
			name of the _model kind_.
		*/
		url: "",
		
		//*@public
		/**
			The current state in a human-friendly form (_string_) of the _model_.
			Will be one of `"NEW"`, `"CLEAN"`, `"DIRTY"`, `"ERROR"`, `"FETCHING"`,
			`"COMMITTING"`, `"DESTROYING"`, `"DESTROYED"`.
		*/
		status: "NEW",
		
		//*@public
		/**
			A simple _Boolean_ flag indicating whether or not the current _model_
			is a locally created _new_ record. Once a _model_ has been _committed_
			or was _fetched_ this will be `false`.
		*/
		isNew: true,
		
		//*@public
		/**
			The _String_ representing which attribute to use as the indexable
			primary key for this _model_. Default is `id`.
		*/
		primaryKey: "id",
		
		//*@public
		/**
			In some cases correct remote calls are generated by some other means
			than the normal url generation. In those cases this _Boolean_ flag needs
			to be set to `true`. Default is `false`.
		*/
		noUrl: false,
		
		//*@public
		/**
			The `enyo.Model` will generate its own events. When a defined `attribute`
			of the _model schema_ is modified an event will be emitted to any
			listeners with an event payload with the `changed` property with the
			changeset, the `previous` property with the previous values of those in
			the changeset and the `model` property that is a reference to this _model_.
		
			When the _model_ is destroyed it will also emit an event with the property
			`model` that is a reference to this _model_ (even though it will already
			have been destroyed).
		*/
		events: {
			onChange: "",
			onDestroy: ""
		},
		
		// ...........................
		// PROTECTED PROPERTIES
		
		_isModel: true,
		_collections: null,
		_relations: null,
		_attributes: null,
		_attributeKeys: null,
		_previous: null,
		_changed: null,
		_euuid: null,
		_isChild: false,
		_defaultModel: false,
		_noApplyMixinDestroy: true,

		// ...........................
		// COMPUTED PROPERTIES

		//*@public
		/**
			Used internally by `enyo.Source` to generate an appropriate request `url`.
			Overload this method in custom setups.
		*/
		query: enyo.computed(function () {
			return !this.noUrl? this.get("url") + "/" + this.get(this.primaryKey) || "": "";
		}),

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		/**
			Overload the `filterData` method which takes a single parameter, the
			incoming payload from a _fetch_ request, and return it having made
			any necessary modifications to it. __This method is executed on the
			the top-level payload prior to individual formatters for defined
			attributes in a known schema__.
		*/
		filterData: function (data) {
			return data;
		},
		
		//*@public
		/**
			When the `enyo.Source` is constructing the request for this _model_
			(regardless of the action) it will call this method which you can
			overload to add custom parameters to the `queryParams` hash of the
			`options` parameter. These parameters are key-value pairs that are
			used to generate the options in a query string in default setups. It
			could also be used for other purposes in overloaded and custom setups.
		*/
		buildQueryParams: function (model, options) {
			// the options parameter will have a hash at property queryParams
			// that can be modified directly by adding properties or using
			// enyo.mixin for example
		},
		
		// ...........................
		// ASYNCHRONOUS METHODS
		
		//*@public
		/**
			The model should execute a _commit_ of its current state. The optional
			_options_ hash can have a `success` method and/or an `error` method
			to be executed on the appropriate result asynchronously.
		*/
		commit: function (options) {
			var $options = options? enyo.clone(options): {};
			$options.postBody = this.raw();
			this.set("status", "COMMITTING");
			this.exec("commit", $options);
		},
		
		//*@public
		/**
			The model should execute a _fetch_. The optional _options_ hash can
			have a `success` method and/or an `error` method to be executed on the
			appropriate result asynchronously.
		*/
		fetch: function (options) {
			this.set("status", "FETCHING");
			this.exec("fetch", options);
		},
		
		//*@public
		/**
			The model should execute a _destroy_ that destroys it in the client
			and also (by default) a _DELETE_ request to the _source_. The optional
			_options_ hash may have a `success` method and/or an `error` method to
			be executed on the appropriate result asynchronously.
		*/
		destroy: function (options) {
			this.set("status", "DESTROYING");
			this.exec("destroy", options);
		},
		
		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups.
		*/
		exec: function (action, options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("did" + enyo.cap(action), options || {});
			$options.error = this.bindSafely("didFail", action, options || {});
			enyo.store[action](this, $options);
		},
		
		// ............................
		
		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups. Note that many of the details of this implementation
			make _models_ work properly and great care should be taken when modifying
			it or you may encounter unexpected or unpredictable results. The third
			parameter can be set to true if you do not wish the result to be passed
			through the filter.
		*/
		didFetch: function (options, result, noFilter) {
			var $data = noFilter? (result || {}): this.filterData(result || {});
			var $attrs = this._attributes;
			var $remts = this._remoteKeys;
			var rem, loc, $prop, $val, $rel, $rels = this._relations;
			var queue = [], $fn;
			// ensure that no events or notifications propagate while we are
			// iterating over these entries in the result set
			this.silence();
			this.stopNotifications();
			for (loc in $attrs) {
				$prop = $attrs[loc];
				rem = $prop.remoteKey || loc;
				$val = $data[rem] || $data[loc];
				$rel = $rels[loc];

				// first we run it through its formatter to ensure it is
				// of the appropriate structure
				$val = $prop.formatter.call(this, loc, $val, "fetch", $data);
				// now we run it through the typeWrangler to ensure that
				// the type conversion takes place if necessary
				$val = $prop.typeWrangler.call(this, loc, $val, "fetch", $data);
				// note that validation of the type will take place when
				// the value is set, not here (single entry point of failure)
				
				// if this attribute is a relation it needs to be handled
				// separately and we need to postpone it until we have already
				// set all of the local props to ensure if one is needed by the
				// related model it will be available
				if ($rel) {
					queue.push(enyo.bind(this, $rel.handler, loc, $rel, $val));
					continue;
				}
				
				// otherwise we simply set the property directly
				this.set(loc, $val);
			}
			
			// now we need to make sure we are adding all of the extraneous data
			// (if any) as well from the payload
			for (rem in $data) { 
				if (this.isAttribute(rem)) {
					continue;
				}
				this.set(rem, $data[rem]);
			}
			
			// now we execute any queued relation handlers
			while (queue.length) {
				$fn = queue.pop();
				$fn();
			}
			
			this.set("isNew", false);
			this.set("status", "CLEAN");
			this.unsilence();
			this.startNotifications();
			this._flushChanges();
			if (options && options.success) {
				options.success(result);
			}
		},
		
		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups.
		*/
		didCommit: function (options, result) {
			if (result && "object" === typeof result) {
				this.set(result);
			}
			this.set("isNew", false);
			this.set("status", "CLEAN");
			this._changed = {};
		},
		
		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups.
		*/
		didDestroy: function (options, result) {
			this.set("status", "DESTROYED");
			this.doDestroy({model: this});
			breakdown(this);
		},
		
		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups. The `action` parameter is one of `"fetch"`, `"destroy"`,
			`"commit"` or `"update"` depicting which action failed.
		*/
		didFail: function (action, options, result) {
			this.set("status", "ERROR");
		},
		
		//*@public
		/**
			Returns an _Object_ literal that represents the JSON parsable form
			of the _model_ in its current state. Takes an optional _Boolean_ that
			if `true` will return the hash with local (client) keys but defaults
			to remote keys if they are defined such that it could be used as a
			payload to the _source_. If no remote keys are defined it defaults to
			using the local (client) keys.
		
			// TODO: Needs to use the typeWrangler and formatter
		*/
		raw: function (local) {
			var $attrs = this._attributes;
			var key, rem, $rel, $rels = this._relations, $ret = {};
			if (local) {
				$ret = enyo.only(this._attributeKeys, enyo.except(enyo.keys(this._relationKeys), this)); 
			} else {
				for (key in $attrs) {
					rem = $attrs[key].remoteKey || key;
					$ret[rem] = this.get(key);
				}
			}
			// now to include any relations that are set to be included
			for (key in $rels) {
				$rel = $rels[key];
				if (!enyo.exists(this[key]) || !$rel.inCommit) {
					continue;
				}
				$ret[local? key: $attrs[key].remoteKey || key] = this[key].raw(local);
			}
			return $ret;
		},

		//*@public
		/**
			Returns the JSON parsed _string_ value for this _model_ in its
			current state as would be appropriate to send in a payload to the _source_.
			If the optional _local_ is `true` then it will return with local keys
			instead of remote keys (if any).
		*/
		toJSON: function (local) {
			return enyo.json.stringify(this.raw(local));
		},
		
		//*@public
		/**
			Returns _Boolean_ `true` or `false` for whether the _prop_
			is an _attribute_ of the _schema_ for this _model_.
		*/
		isAttribute: function (prop) {
			return !!~enyo.indexOf(prop, this._attributeKeys);
		},
		
		//*@public
		/**
			Returns _Boolean_ `true` or `false` for whether the _prop_
			is known by the _model schema_ as a _remoteKey_.
		*/
		isRemoteAttribute: function (prop) {
			return prop in this._remoteKeys;
		},
		
		//*@public
		/**
			Returns _Boolean_ `true` or `false` for whether _prop_
			is a _relation_ or not.
		*/
		isRelation: function (prop) {
			return !! (prop in this._relations);
		},
		
		//*@public
		/**
			Retrieve the previous value for _prop_ (when it exists).
		*/
		previous: function (prop) {
			return this._previous[prop];
		},
		
		//*@public
		/**
			This is a specially overloaded version of `enyo.Object.set`. It
			takes either a _hash_ or a _string_ and _value_ combined as its
			parameters.
		*/
		set: function (prop, val) {
			if (enyo.isObject(prop)) {
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
				this.status = "DIRTY";
				return this.setRelation(prop, val);
			} else {
				if (this.isAttribute(prop)) {
					this.status = "DIRTY";
				}
				return this.inherited(arguments);
			}
		},
		
		//*@public
		/**
			Used to set values for a given (and defined) _relation_ for an _attribute_
			of the _schema_. Do not call this method directly. It may be overloaded in
			non-standard use-cases.
		*/
		setRelation: function (prop, val) {
			var $rel = this._relations[prop];
			$rel.handler.call(this, prop, $rel, val);
			return this;
		},
		
		//*@public
		/**
			The constructor needs to be able to properly initialize the
			internal (protected) properties but is also responsible for
			determining if the _schema_ is defined and if not attempt to
			implicitly derive it from the passed in values. If there is
			no _schema_ defined and no initial _values_ passed in much of
			its functionality will not work as intended.
		*/
		constructor: function (values, recursing) {
			// first we have a local reference to the original values
			// passed into the object (if there were any)
			var $values = values;
			var $defaults = this.defaults;
			// here we handle defaults so we can attempt both scenarios
			// (incoming values and default values) at the same time
			if (!recursing) {
				if ($defaults) {
					// we go ahead and look for functions in the defaults and execute them
					// now so we can keep all of this handling in one place
					for (var key in $defaults) {
						if (enyo.isFunction($defaults[key])) {
							$defaults[key] = $defaults[key].call(this);
						}
					}
					$values = $values? enyo.mixin($values, $defaults, true): $defaults;
				}
				// initialize our relations (if any)
				initRelations.call(this);
			}
			// we set the object to undefined so we can allow the constructor
			// chain to continue without automatically applying these values
			// to this record
			if (!recursing) {
				values = undefined;
				// allow the remaining constructors to complete their initialization
				this.inherited(arguments);
				// initialize our variables
				this._collections = [];
				this._previous = {};
				this._changed = {};
			}
			// now we can safely apply any initial values if we have some
			// note that if there are values we are no longer a new status
			// we are clean because we aren't empty
			if ($values) {
				// if we have a defined structure we adhere to the structure
				// otherwise we implicitly derive the structure but no special
				// relationships
				if (this._attributeKeys.length > 1) {
					this.didFetch({}, $values, true);
				} else if (recursing) {
					// this is an error state because we did not determine any
					// schema for the values passed in
					this.set("state", "ERROR");
					return;
				} else {
					// will attempt to figure out what our schema should be with
					// all defaults
					var $schema = {};
					// we create an object with all of the keys but no values so
					// it does not interfere with the initialization
					enyo.forEach(enyo.keys($values), function (key) {
						$schema[key] = null;
					});
					// in case it is useful later we denote this record as being a model
					// whose schema was derived implicitly and not defined explicitly
					this._defaultModel = true;
					// run the new schema through initialization routine
					initModel(this, $schema);
					// now rerun this same constructor with the new schema already defined
					return this._constructor($values, true);
				}
				// we set our status to clean because we have values
				this.status = "CLEAN";
				// set our previous up initially
				this._previous = enyo.only(this._attributeKeys, this);
				// we flush notifications
				this.startNotifications();
			}
		},

		//*@public
		/**
			This method was deliberately overloaded to avoid a deeper nested
			call in the inheritance stack. It is not recommended to overload it
			again unless you know exactly what you are doing.
		*/
		ownerChanged: function(old) {
			if (old && old.removeComponent) {
				old.removeComponent(this);
			}
			if (this.owner && this.owner.addComponent) {
				this.owner.addComponent(this);
			}
		},
		
		// ...........................
		// PROTECTED METHODS

		//*@protected
		/**
			Used internally to register any collections that might have
			a reference to this model in it. Thus ensuring that each collection
			will receive any events propagated from this _model_.
		*/
		_addCollection: function (col) {
			if (!~enyo.indexOf(col, this._collections)) {
				this._collections.push(col);
				this.addDispatchTarget(col);
			}
		},

		//*@protected
		/**
			Used internally to remove registered collections from the _model_.
		*/
		_removeCollection: function (col) {
			var idx = enyo.indexOf(col, this._collections);
			if (!!~idx) {
				this._collections.splice(idx, 1);
				this.removeDispatchTarget(col);
			}
		},

		//*@protected
		/**
			Used at the appropriate time to emit a _onChange_ event with the
			changeset, previous values and a reference to the model that changed
			(this _model_).
		*/
		_flushChanges: function () {
			if (!this._silenced) {
				this.doChange({
					previous: this._previous,
					changed: this._changed,
					model: this
				});
			}
		},

		// ...........................
		// OBSERVERS

		//*@protected
		/**
			Spies on all change notifications and adds to the changeset for
			the model. It will execute a _flushChanges_ that will emit the
			_onChange_ event if the _model_ isn't currently silenced.
		*/
		_attributeSpy: enyo.observer(function (prop, prev, val) {
			if (this.isAttribute(prop) || this.isRelation(prop)) {
				this._previous[prop] = prev;
				this._changed[prop] = val;
				this._flushChanges();
			}
		}, "*")

	});

})(enyo);