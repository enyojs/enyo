(function (enyo) {

	//*@public
	/**
		Takes an object and returns a _Boolean_ `true` | `false` if
		the object is a `enyo.Model` or _subkind_.
	*/
	enyo.isModel = function (obj) {
		return !! (obj && obj.__isModel);
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
		isOwner: function (props) {
			if (!enyo.exists(props.isOwner)) {
				props.isOwner = true;
			}
		},
		inCommit: function (props) {
			if (!props.isOwner && !enyo.exists(props.inCommit)) {
				props.inCommit = true;
			} else if (!enyo.exists(props.inCommit)) {
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
		for (var $i=0, k$; (k$=relationKeys[$i]); ++$i) {
			relationInitializers[k$](props);
		}
	};

	//*@protected
	/**
		Executed in the context of the record.
	*/
	var toOneHandler = function (key, rel, val) {
		var $k = key, $r = rel, $v = val;
		var $m = this[$k], $o;
		if (!$m) {
			if ($r.isOwner) {
				if (enyo.isObject($v)) {
					$v[$r.inverseKey] = this;
					$m = this[$k] = new $r.model($v);
					$m.relationKey = $k;
				} else {
					$o = enyo.pool.claimObject(true);
					$o.params = enyo.pool.claimObject(true);
					$o.params[$r.inverseKey] = this[$r.relationKey];
					$m = enyo.store.findOne($r.model, $o);
					if (!$m) {
						$m = new $r.model();
						$m.relationKey = $k;
						$m.set($r.inverseKey, this);
						if ($r.autoFetch) {
							$m.fetch();
						}
					}
				}
			} else {
				$m = this[$k] = $v;
				this.addDispatchTarget($m);
			}
		} else {
			if ($r.isOwner) {
				$m.didFetch(($o = enyo.pool.claimObject()), $v);
			}
		}
		enyo.pool.releaseObject($o);
	};

	//*@protected
	/**
		Executed in the context of the record.
	*/
	var toManyHandler = function (key, rel, val) {
		var $k = key, $r = rel, $v = val;
		var $m = this[$k], $o, $c;
		if (!$m) {
			$c = $r.collection.prototype.relation || $r;
			$m = this[$k] = enyo.singleton({kind: $r.collection, relation: enyo.clone($c)});
			$m.relationKey = $k;
			$m.addDispatchTarget(this);
			if ($r.inverseKey) {
				$m.set($r.inverseKey, this);
			}
			if ($v) {
				if (enyo.isArray($v)) {
					$m.addMany($v);
				} else if (enyo.isObject($v)) {
					$m.didFetch(($o = enyo.pool.claimObject()), $v);
				}
			}
		} else {
			if ($v) {
				$m.didFetch(($o = enyo.pool.claimObject()), $v);
			}
		}
		enyo.pool.releaseObject($o);
	};

	//*@public
	enyo.toOne = function (props) {
		var $p = props || {};
		$p._kind = "toOne";
		$p.handler = $p.handler || toOneHandler;
		initRelation($p);
		return $p;
	};

	//*@public
	enyo.toMany = function (props) {
		var $p = props || {};
		$p._kind = "toMany";
		$p.handler = $p.handler || toManyHandler;
		initRelation($p);
		return $p;
	};

	//*@protected
	var defaultFormatter = function (key, value, action, payload) {
		return value;
	};

	//*@protected
	var initializers = {
		/**
			If there is a remote key defined we track that and create
			the appropriate map between the local and remote key.
		*/
		remoteKey: function (proto, key, attr) {
			var $k = proto.__remoteKeys || (proto.__remoteKeys = {}), $a = attr;
			if ($a.remoteKey) {
				$k[$a.remoteKey] = key;
			}
		},
		type: function (proto, key, attr) {
			// nop for now
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
			var $r = proto.__relations || (proto.__relations = {}), $a = attr;
			if ($a.relation) {
				$r[key] = $a.relation;
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
		var $s = attrs, $a = attr, $k = key;
		var $p = $s[$k] = $a? enyo.only(attributeKeys, $a): {};
		var $r = proto;
		for (var $i=0, f$; (f$=attributeKeys[$i]); ++$i) {
			initializers[f$]($r, $k, $p);
		}
	};

	//*@protected
	/**
		Attempt to do all the necessary setup on our attributes in a single
		pass as opposed to several. Actions are broken up for modularity,
		better (internal) extensibility in the future and easier debugging.
	*/
	var normalizeAttributes = function (proto, attrs) {
		var $k, $p = proto, $s = $p.__attributeKeys, $a = attrs, t$;
		if ($s) {
			$s = ($p.__attributeKeys = enyo.clone($s));
		} else {
			$s = ($p.__attributeKeys = []);
		}
		for ($k in $a) {
			if (!~enyo.indexOf($k, $s)) {
				$s.push($k);
			}
			t$ = $a[$k] = enyo.clone($a[$k]);
			normalizeAttribute($p, $k, t$, $a);
		}
	};

	//*@protected
	var initRelations = function () {
		// TODO: This could be improved to be far more performant without the
		// requirement of doing it at runtime
		var $k, r$, $s = this.__relations || (this.__relations = {});
		for ($k in $s) {
			r$ = $s[$k];
			if (r$.isOwner) {
				switch (r$._kind) {
				case "toOne":
					if (!enyo.isFunction(r$.model)) {
						r$.model = enyo.getPath(r$.model);
					}
					break;
				case "toMany":
					if (!enyo.isFunction(r$.collection)) {
						r$.collection = enyo.getPath(r$.collection);
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
		var $k, r$, $m = model, $r = $m.__relations;
		for ($k in $r) {
			r$ = $r[$k];
			if (r$.isOwner) {
				// TODO: We currently orphan related models but perhaps we
				// should be destroying them as well
				if (r$._kind == "toMany") {
					if ($m[$k]) {
						$m[$k].destroy();
						$m[$k] = null;
					}
				} else if (r$._kind == "toOne") {
					if ($m[$k]) {
						$m[$k].removeDispatchTarget($m);
						if (r$.inverseKey) {
							$m[$k].set(r$.inverseKey, null);
						}
						$m[$k] = null;
					}
				}
			}
		}
		enyo.Component.prototype.destroy.call($m);
	};

	//*@protected
	/**
		Initialization routine for all model kinds. Is abstracted such that
		it can be used at run-time for generic models that are attempting to
		infer their own schemas from the data structure they encountered.
	*/
	var initModel = function (proto, props) {
		var $p = proto;
		// if the prototype already has attributes defined we want to preserve
		// them - and ensure that modifications will not transcend the kind
		if ($p.__attributes) {
			$p.__attributes = enyo.clone($p.__attributes);
		} else {
			// otherwise we have to create a new object hash
			$p.__attributes = {};
		}
		// same deal with the relations
		if ($p.__relations) {
			$p.__relations = enyo.clone($p.__relations);
		}
		// FIXME: This will most likely break some inheritance
		// between models...
		enyo.mixin($p.__attributes, props, {ignore: true});
		normalizeAttributes($p, $p.__attributes);
	};

	//*@protected
	/**
		When the kind features chain comes across a model definition
		we need to ensure some setup so we do this once for any kind
		up front to be as efficient as possible.
	*/
	enyo.kind.features.push(function (ctor, props) {
		var $c = ctor, $s = props, $p = $c.prototype, $o;
		if (isModel($p)) {
			// this is part of the kind registration for a store
			enyo.models.add($c);
			// initialize the prototype
			initModel($p, $s.attributes || ($o = enyo.pool.claimObject(true)));
			// remote attributes completely as they have been moved
			delete $p.attributes;
			// if there isn't a url defined we attempt to make one for
			// conventional purposes
			$p.url = $s.url || !$p.noUrl? ($p.name || $p.kindName).replace(/^(.*)\./g,""): "";
			enyo.pool.releaseObject($o);
		}
	});
	
	//*@protected
	var isRemoteKey = function (k) {
		var $a = this.__attributes;
		for (var $i in $a) {
			if ($a[$i].remoteKey == k) {
				return true;
			}
		}
		return false;
	};

	//*@protected
	/**
		Without interfering with the construction chain we need to register
		the record with the store. This cannot be done in during the construction
		chain.
	*/
	enyo.kind.postConstructors.push(function () {
		if (this.__isModel) {
			enyo.models.queue(this);
		}
	});

	//*@public
	/**
		The _status_ of an `enyo.Model` will be one of those defined by values in
		`enyo.Model`. They can be checked explicitly against these statuc globals
		(e.g. `enyo.Model.ERROR.TYPE`).
	*/
	var STATES = {};

	//*@public
	/**
		There are multiple error states each with a different meaning.
	*/
	var ERROR = STATES.ERROR = {};

	/**
		When an attribute with a defined `type` is `set` on a model and fails
		to be or become (after being run through the `typeWrangler`) the correct
		`type` the model enters this state.
	*/
	ERROR.TYPE =						0x01;

	/**
		When an error occurs during initialization because the model could not
		determine the _schema_ for attributes based on their definition or implied
		from `defaults` or data supplied to the constructor the model enters this
		state.
	*/
	ERROR.SCHEMA =						0x02;

	/**
		When a model receives a bad response from the `enyo.Source` for the application
		it will enter this state.
	*/
	ERROR.RESPONSE =					0x03;

	/**
		When a model attempts to execute an action against a remote and the store does
		not exist or the source is unavailable it will enter this state.
	*/
	ERROR.SOURCE =						0x04;

	//*@public
	/**
		When the model is attempting to fetch, commit or destroy it will be in a busy
		state, one of the following.
	*/
	var BUSY = STATES.BUSY = {};

	/**
		When the model is in the process of fetching data from the `enyo.Source` for the
		application it will enter this state.
	*/
	BUSY.FETCHING		=				0x11;

	/**
		When the model is in the process of committing data to the `enyo.Source` for the
		application it will enter this state.
	*/
	BUSY.COMMITTING		=				0x12;

	/**
		When the model is in the process of being destroyed it will be in this state.
	*/
	BUSY.DESTROYING		=				0x13;

	//*@public
	/**
		The CLEAN state implies that the model has had values applie to it but they
		are synchronized with the given `source` and does not need to be committed.
		This is also true of a model whose values were set during construction or if
		it had default values defined and applied.
	*/
	var CLEAN = STATES.CLEAN =			0x21;

	//*@public
	/**
		If a model has been destroyed it will no longer exist in the `enyo.store` or
		in the remote. Changes will not be tracked.
	*/
	var DESTROYED = STATES.DESTROYED =	0x31;

	//*@public
	/**
		A model will be in the NEW state if it is recently created and has had no
		values applied to it that are in the defined schema (either via attributes
		explicitly or defaults/initial values implicitly). If default values are used
		during setup or values applied the model will not be in the NEW state.
	*/
	var NEW = STATES.NEW =				0x41;

	//*@public
	/**
		A model will be in the DIRTY state if it has a defined schema and an attribute
		of the schema has been modified and it needs to be synchronized. The only
		exception is if a model is created and uses default values it will not be in
		the DIRTY state until a modification takes place.
	*/
	var DIRTY = STATES.DIRTY =			0x51;

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
					type: String
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
			The `status` of the model is defined by a fixed-set of enumerated
			values. See documentation for `enyo.Model` states.
		*/
		status: NEW,

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
		noFetchId: true,

		//*@public
		/**
			In some cases correct remote calls are generated by some other means
			than the normal url generation. In those cases this _Boolean_ flag needs
			to be set to `true`. Default is `false`.
		*/
		noUrl: false,
		
		//*@public
		/**
			In cases where the url is arbitrarily set and needs to be used as-is set
			this flag to true. This setting will ignore the `noUrl` property value.
		*/
		rawUrl: false,
		
		//*@public
		/**
			In cases where the commit body should be a subset of the attributes
			explicitly or implicitly defined by the schema set this property to
			an array of the keys that should be included. For a programmatic way
			of filtering payload data use the `filterData` method and watch for
			the second parameter to be `commit`.
		*/
		includeKeys: null,

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
			onDestroy: "",
			onError: ""
		},

		//*@public
		handlers: {
			onChange: "__relationChanged",
			onModelChanged: "__relationChanged"
		},

		//*@public
		statics: STATES,
		
		//*@public
		/**
			Assigned by an enyo.Store at model instantiation. Unqiue identifier that
			it uses for indexing but can also be used for local-only data instead of
			creating a unique id.
		*/
		euuid: null,

		// ...........................
		// PROTECTED PROPERTIES

		__isModel: true,
		__collections: null,
		__relations: null,
		__attributes: null,
		__attributeKeys: null,
		__previous: null,
		__changed: null,
		__defaultModel: false,
		__noApplyMixinDestroy: true,

		// ...........................
		// COMPUTED PROPERTIES

		//*@public
		/**
			Used internally by `enyo.Source` to generate an appropriate request `url`.
			Overload this method in custom setups.
		*/
		query: enyo.computed(function () {
			return !this.noUrl && !this.rawUrl? this.get("url") + "/" + this.get(this.primaryKey) || "": this.rawUrl? this.get("url"): "";
		}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Overload the `filterData` method to conditionally mutate data
			for incoming and outgoing payloads. The `data` parameter is the
			data to be mutated. The `direction` parameter will be one of `fetch`
			or `commit`, for incoming data and outgoing data respectively. The
			return value will be the data presented to the `didFetch` method and
			the included payload in commits when appropriate.
		*/
		filterData: function (data, direction) {
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
			this.set("status", BUSY.COMMITTING);
			$options.postBody = this.filterData(this.raw(), "commit");
			this.exec("commit", $options);
		},

		//*@public
		/**
			The model should execute a _fetch_. The optional _options_ hash can
			have a `success` method and/or an `error` method to be executed on the
			appropriate result asynchronously.
		*/
		fetch: function (options) {
			this.set("status", BUSY.FETCHING);
			this.exec("fetch", options);
			this.__hasFetched = true;
		},

		//*@public
		/**
			The model should execute a _destroy_ that destroys it in the client
			and also (by default) a _DELETE_ request to the _source_. The optional
			_options_ hash may have a `success` method and/or an `error` method to
			be executed on the appropriate result asynchronously.
		*/
		destroy: function (options) {
			this.set("status", BUSY.DESTROYING);
			this.exec("destroy", options);
		},

		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups.
		*/
		exec: function (action, options) {
			if (enyo.store) {
				var $options = options? enyo.clone(options): {};
				$options.success = this.bindSafely("did" + enyo.cap(action), options || {});
				$options.error = this.bindSafely("didFail", action, options || {});
				enyo.store[action](this, $options);
			} else {
				this.set("status", ERROR.SOURCE);
			}
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
			var $o = enyo.pool.claimObject(true);
			var $d = noFilter? (result || $o): this.filterData(result || $o, "fetch");
			var $g = this.defaults;
			var $k = enyo.merge(enyo.keys($d), enyo.keys($g));
			this.silence();
			this.stopNotifications();
			// if we haven't fetched before we will run the data through the schema
			// generator to ensure we have the full schema from the data structure
			// but only trigger this if there is any data to begin with
			if ($k.length) {
				if (!this.__hasFetched) {
					this.createSchemaFromData(enyo.mixin([$d, $g], {ignore: true}));
				}
				var $a = this.__attributes;
				var $r = this.__relations, $p, p$, k$, r$, v$, $q = [], $f;
				for ($p in $a) {
					p$ = $a[$p];
					k$ = p$.remoteKey || $p;
					v$ = $d[$p] || $d[k$];
					// we do not run default data through the formatter
					if (!v$ && !this.__hasFetched && enyo.exists(($g[$p] || $g[k$]))) {
						v$ = $g[$p] || $g[k$];
						if (enyo.isFunction(v$)) {
							v$ = v$.call(this);
						}
					} else {
						// run the data through the formatter but obviously this will
						// only happen if it was in the payload to begin with to avoid
						// having the formatter run against non-data
						try {
							v$ = p$.formatter.call(this, $p, v$, "fetch", $d);
						} catch (e) {
							v$ = null;
						}
					}
					r$ = $r[$p];
					// queue any relation actions until the rest as been completed
					if (r$) {
						$q.push(enyo.bind(this, r$.handler, $p, r$, v$));
						// we continue because we do not want to trigger any notifications
						// or changes for this attribute yet
						continue;
					}
					this.set($p, v$);
				}
				// now we run all of the relation functions in the queue
				while ($q.length) {
					$f = $q.pop();
					$f();
				}
			}
			this.set("isNew", false);
			this.set("status", CLEAN);
			// NOTE: This is carefully ordered here
			this.startNotifications();
			this.unsilence();
			this.flushChanges();
			if (options && options.success) {
				options.success(result, this, options);
			}
			if (enyo.keys($d).length) {
				this.__hasFetched = true;
			}
			this._defaults = this.defaults;
			enyo.pool.releaseObject($o);
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
			this.set("status", CLEAN);
			this.__changed = {};
			for (var key in this.__relations) {
				if (this.__relations[key].isOwner) {
					if (this[key]) {
						this[key].set("status", CLEAN);
					}
				}
			}
			if (options && options.success) {
				options.success(result, this, options);
			}
		},

		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups.
		*/
		didDestroy: function (options, result) {
			this.set("status", DESTROYED);
			this.doDestroy({model: this});
			breakdown(this);
			if (options && options.success) {
				options.success(result, this, options);
			}
		},

		//*@public
		/**
			While this method should not be executed directly it is overloadable
			in custom setups. The `action` parameter is one of `"fetch"`, `"destroy"`,
			`"commit"` or `"update"` depicting which action failed.
		*/
		didFail: function (action, options, result) {
			this.set("status", ERROR.RESPONSE);
			if (options && options.error) {
				options.error(result, this, options);
			}
		},

		//*@public
		/**
			Returns an _Object_ literal that represents the JSON parsable form
			of the _model_ in its current state. Takes an optional _Boolean_ that
			if `true` will return the hash with local (client) keys but defaults
			to remote keys if they are defined such that it could be used as a
			payload to the _source_. If no remote keys are defined it defaults to
			using the local (client) keys.
		*/
		raw: function (local) {
			var $a = this.__attributes;
			var $r = this.__relations;
			var $k = enyo.keys($r), $t, $l, $n, $i;
			if (local) {
				$t = enyo.only(this.__attributeKeys, enyo.except($k, this));
			} else {
				$t = {};
				for ($l in $a) {
					$n = $a[$l].remoteKey || $l;
					if (!~enyo.indexOf($l, $k)) {
						$t[$n] = $a[$l].formatter($l, this.get($l), "commit", this);
					}
				}
			}
			for ($l in $r) {
				$n = $r[$l];
				$i = this[$l] && $n.inverseKey? this[$l].__relations[$n.inverseKey]: null;
				if (!$n.isOwner || (!enyo.exists(this[$l]) || (!$n.inCommit && ($i && !$i.inCommit)))) {
					continue;
				}
				$t[local? $l: $a[$l].remoteKey || $l] = this[$l].raw(local);
			}
			return this.includeKeys.length? enyo.only(this.includeKeys, $t): $t;
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
			return !!~enyo.indexOf(prop, this.__attributeKeys);
		},

		//*@public
		/**
			Returns _Boolean_ `true` or `false` for whether the _prop_
			is known by the _model schema_ as a _remoteKey_.
		*/
		isRemoteAttribute: function (prop) {
			return prop in this.__remoteKeys;
		},

		//*@public
		/**
			Returns _Boolean_ `true` or `false` for whether _prop_
			is a _relation_ or not.
		*/
		isRelation: function (prop) {
			return !! (prop in this.__relations);
		},

		//*@public
		/**
			Retrieve the previous value for _prop_ (when it exists).
		*/
		previous: function (prop) {
			return this.__previous[prop];
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
				this.flushChanges();
				return this;
			} else if (this.isRelation(prop)) {
				return this.setRelation(prop, val);
			} else {
				this.inherited(arguments);
				if (prop != this.primaryKey && this.isAttribute(prop)) {
					this.set("status", DIRTY);
				}
				return this;
			}
		},

		//*@public
		/**
			Used to set values for a given (and defined) _relation_ for an _attribute_
			of the _schema_. Do not call this method directly. It may be overloaded in
			non-standard use-cases.
		*/
		setRelation: function (prop, val) {
			var $r = this.__relations[prop];
			$r.handler.call(this, prop, $r, val);
			this.set("status", DIRTY);
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
		constructor: function (values) {
			var $v = values || enyo.pool.claimObject(true);
			var $t = enyo.pool.claimObject();
			var $d = this.defaults || enyo.pool.claimObject(true);
			var $c = $v;
			// default behavior of importing properties passed in will not
			// work for our purposes
			values = undefined;
			this.inherited(arguments);
			this.__collections = [];
			this.__previous = {};
			this.__changed = {};
			this.includeKeys = this.includeKeys || [];
			this.defaults = this.defaults || $d;
			// because we don't know whether data being passed in to the constructor
			// will have the local format or the remote format and we want to be able
			// to allow the filterData method to execute without always needing to know
			// which case it is we catch errors and use the original structure if
			// it fails and use the noFilter option for didFetch knowing we've already
			// filtered it either way
			try {
				$v = this.filterData($v, "fetch");
			} catch (e) {
				$v = $c;
			}
			initRelations.call(this);
			this.didFetch($t, $v, true);
			// because we arbitrarily called didFetch here we will reset our
			// state properly to clean and reset anything that will have changed
			if (enyo.keys($d).length || enyo.keys(enyo.except(enyo.keys($d), $v)).length) {
				this.status = CLEAN;
				this.__changed = {};
				this.__previous = enyo.only(this.__attributeKeys, this);
			} else {
				this.status = NEW;
			}
			enyo.pool.releaseObject($v, $d, $t);
		},
		
		//*@public
		/**
			Attempts to generate a schema implicitly from a data structure.
		*/
		createSchemaFromData: function (data) {
			var $s = enyo.pool.claimObject(true);
			for (var $k in data) {
				if (!isRemoteKey.call(this, $k)) {
					$s[$k] = null;
				}
			}
			this.__defaultModel = true;
			initModel(this, $s);
			enyo.pool.releaseObject($s);
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
			if (this.owner && true === (this.owner instanceof enyo.Component)) {
				this.set("_defaultTarget", this.owner);
				this.set("_defaultDispatch", true);
			} else {
				// otherwise we either don't have an owner or they cannot
				// accept events so we remove our bubble target
				this.set("_defaultTarget", null);
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
		addCollection: function (c) {
			if (!~enyo.indexOf(c, this.__collections)) {
				this.__collections.push(c);
				this.addDispatchTarget(c);
				for (var $k in this.__relations) {
					if (c[$k]) {
						this.stopNotifications(true);
						this.set($k, c[$k]);
						this.set("status", CLEAN);
						this.startNotifications(true);
					}
				}
			}
		},

		//*@protected
		/**
			Used internally to remove registered collections from the _model_.
		*/
		removeCollection: function (c) {
			var $i = enyo.indexOf(c, this.__collections);
			if (!!~$i) {
				this.__collections.splice($i, 1);
				this.removeDispatchTarget(c);
			}
		},

		//*@protected
		/**
			Used at the appropriate time to emit a _onChange_ event with the
			changeset, previous values and a reference to the model that changed
			(this _model_).
		*/
		flushChanges: function () {
			this.doChange({previous: this.___previous, changed: this.__changed, model: this});
		},

		//*@protected
		__relationChanged: function (sender, event) {
			var $m = event.model || sender, $k = $m.relationKey;
			if (!$k && event.collection) {
				$m = event.collection;
				$k = $m.relationKey;
			}
			if ($k) {
				if (this[$k] == $m) {
					this.__changed[$k] = $m;
					this.set("status", DIRTY);
				}
			}
		},

		//*@protected
		/**
			Retrieves the attribute object for a given attribute `property`
			if it exists.
		*/
		__attributeFor: function (prop) {
			return this.__attributes[prop];
		},

		// ...........................
		// OBSERVERS

		//*@protected
		/**
			Spies on all change notifications and adds to the changeset for
			the model. It will execute a flushChanges_ that will emit the
			_onChange_ event if the _model_ isn't currently silenced.
		*/
		__attributeSpy: enyo.observer(function (prop, prev, val) {
			if (this.__attributeFor(prop) || this.isRelation(prop)) {
				// TODO: Type checking has been temporarily removed
				// and should probably be added as validation instead
				this.__previous[prop] = prev;
				this.__changed[prop] = val;
				this.flushChanges();
			}
		}, "*"),

		//*@protected
		__statusChanged: enyo.observer(function (prop, prev, val) {
			var $i, c$;
			if (val === DIRTY) {
				for ($i=0; (c$=this.__collections[$i]); ++$i) {
					c$.addDirtyModel(this);
				}
			} else if (val === CLEAN) {
				for ($i=0; (c$=this.__collections[$i]); ++$i) {
					c$.removeDirtyModel(this);
				}
			}
		}, "status")

	});

})(enyo);