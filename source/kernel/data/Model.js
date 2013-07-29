(function (enyo) {

	//*@public
	/**
		Returns a Boolean true or false indicating whether the passed-in object is
		an _enyo.Model_ or a subkind of _enyo.Model_.
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
			If there is a remote key defined, we track that and create
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
			If a formatter was defined as a string, we attempt to obtain it from
			the prototype for the model; if it isn't found, we use the default.
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
			If a relation is defined for the attribute, we go ahead and
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
		A separate initializer is set up for each of these for the sake of
		modularity, better (internal) extensibility in the future, and greater ease
		of debugging. They are retrieved from the initializers because, for future
		options, you only need to add the entry there and it will automatically be
		handled.
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
		Attempts to do all the necessary setup for our attributes in a single pass
		as opposed to multiple passes. Actions are broken up for the sake of
		modularity, better (internal) extensibility in the future, and greater ease
		of debugging.
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
		Breaks down a destroyed model.
	*/
	var breakdown = function (model) {
		var $k, r$, $m = model, $r = $m.__relations;
		for ($k in $r) {
			r$ = $r[$k];
			if (r$.isOwner) {
				// TODO: We currently orphan related models, but perhaps we
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
		it can be used at runtime for generic models that are attempting to
		infer their own schemas from the data structures they encounter.
	*/
	var initModel = function (proto, props) {
		var $p = proto;
		// if the prototype already has attributes defined, we want to preserve
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
		When the kind features chain comes across a model definition,
		we need to ensure some setup, so we do this once for any kind
		up front to be as efficient as possible.
	*/
	enyo.kind.features.push(function (ctor, props) {
		var $c = ctor, $s = props, $p = $c.prototype, $o;
		if (isModel($p)) {
			// this is part of the kind registration for a store
			enyo.models.add($c);
			// initialize the prototype
			initModel($p, $s.attributes || ($o = enyo.pool.claimObject(true)));
			// remove attributes completely, as they have been moved
			delete $p.attributes;
			// if there isn't a url defined, we attempt to make one to follow
			// convention
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
		Without interfering with the construction chain, we need to register
		the record with the store. This cannot be done during the construction
		chain.
	*/
	enyo.kind.postConstructors.push(function () {
		if (this.__isModel) {
			enyo.models.queue(this);
		}
	});

	//*@public
	/**
		The status of an _enyo.Model_ will be one of values defined in the _STATES_
		hash. A Model's status may be checked explicitly against these status
		globals (e.g., _enyo.Model.ERROR.TYPE_).
	*/
	var STATES = {};

	//*@public
	/**
		There are multiple error states, each with a different meaning
	*/
	var ERROR = STATES.ERROR = {};

	/**
		The state of a model when an attribute is set with a defined type, but fails
		to be or become (after being run through the typeWrangler) the correct type
	*/
	ERROR.TYPE =						0x01;

	/**
		The state of a model when an error occurs during initialization because the
		model cannot determine the schema for attributes directly from a definition
		or by inference from defaults or data supplied to the constructor
	*/
	ERROR.SCHEMA =						0x02;

	/**
		The state of a model that receives a bad response from the _enyo.Source_ for
		the application
	*/
	ERROR.RESPONSE =					0x03;

	/**
		The state of a model that attempts to execute an action against a remote
		when the store does not exist or the source is unavailable
	*/
	ERROR.SOURCE =						0x04;

	//*@public
	/**
		When the model is attempting to fetch, commit, or destroy, it will be in one
		of the _BUSY_ states.
	*/
	var BUSY = STATES.BUSY = {};

	/**
		The state of a model that is in the process of fetching data from the
		_enyo.Source_ for the application
	*/
	BUSY.FETCHING		=				0x11;

	/**
		The state of a model that is in the process of committing data to the
		_enyo.Source_ for the application
	*/
	BUSY.COMMITTING		=				0x12;

	/**
		The state of a model that is in the process of being destroyed
	*/
	BUSY.DESTROYING		=				0x13;

	//*@public
	/**
		The state of a model that has had values applied to it, but only values that
		are synchronized with the given source and do not need to be committed. For
		example, this will be the state of a model whose values have just been set
		during construction, or one to which default values have just been applied.
	*/
	var CLEAN = STATES.CLEAN =			0x21;

	//*@public
	/**
		The state of a model that has been destroyed.  It will no longer exist in
		the	_enyo.Store_ or in the remote, and changes will not be tracked.
	*/
	var DESTROYED = STATES.DESTROYED =	0x31;

	//*@public
	/**
		The state of a recently-created model, to which no values have been applied
		(either explicitly via attributes or implicitly via	defaults/initial
		values). If default values are used during setup or values are applied
		later, the model will not be in the _NEW_ state.
	*/
	var NEW = STATES.NEW =				0x41;

	//*@public
	/**
		The state of a model that has a defined schema with an attribute that has
		been modified and needs to be synchronized. The only exception is a
		recently-created model that still retains default values; it will not be in
		the _DIRTY_ state until a modification takes place.
	*/
	var DIRTY = STATES.DIRTY =			0x51;

	//*@public
	/**
		_enyo.Model_ is, simply put, an object that represents data. It
		has a common and abstracted interface through which it may be manipulated
		and persisted. When used in conjunction with
		[enyo.Collection](#enyo.Collection), [enyo.Store](#enyo.Store), and
		[enyo.Source](#enyo.Source), it can be a well-defined schema representing
		objects used in your application. The schema may be explicitly defined or
		implicitly derived, depending on your specific implementation and needs.

		See [enyo.Collection](#enyo.Collection), [enyo.Store](#enyo.Store), and
		[enyo.Source](#enyo.Source).

		TODO: There are still features left to be implemented, including (but not
		limited to) the following:

		- field validators and error state based on validation
		- optional change set commits (as opposed to every field on every commit)

		A schema for a model is defined in the _attributes_ property (hash). Each
		key in this hash represents an entry in the schema. It can be better defined
		with the _schema options_ hash. The schema options are a set of properties
		that describe what this attribute is and, in some cases, how it interacts with
		other schemas. The schema options are as follows.

		### [Schema Options](id:schema-options)

		#### [_remoteKey_](id:remoteKey) - _String_

		In cases where the remote key should differ from the local key, specify what
		_remoteKey_ should be paired with this local key. For example, a table in
		your RDBMS schema may have an index of _my\_table\_id_, but because this is
		ugly to reference in the client-side source, you could map it to (local) _id_.

        attributes: {
            // the key defined here is the attribute we want to use
            // in our application
            id: {
                // here we tell it that the remote key it should use
                // for this will have a different name
                remoteKey: "my_table_id"
            }
        }

		#### [_type_](id:type) - _Function (object constructor)_ or _String_

		When specified, the incoming data will be passed to the constructor defined
		by _type_. For example, if your database provides a value representing a
		date but is stored as a Unix timestamp, you could specify _Date_ as the
		_type_ and when data is retrieved/added for this key, it will be passed to
		the constructor for the named _type_. This may be a constructor or a String
		placeholder for a constructor.
		
		If the _type_ is a custom kind that requires more work than simply supplying
		the data to the constructor, you will have to use the typeWrangler schema
		option for type coercion. Note that if a _type_ is specified but coercion
		fails, the model will throw an exception. This should be used as a sanity
		check and may help you to find flaws in schema designs, both local and
		remote.

        attributes: {
            published: {
                type: Date
            }
        }

		#### [_formatter_](id:formatter) - _Function_ or _String_

		Sometimes incoming data will be in a non-useful form or structure.
		While both the _enyo.Source_ and _enyo.Model_ kinds supply a generic
		_filter()_ method for incoming data, it may be more convenient to create a
		separate data formatter for a particular key. For example, if you're using a
		public API to retrieve data and it comes back as a nested object in which
		the useful data is deep in the tree, you can use this method to retrieve
		just the useful information. This method must return the desired data. If a
		typeWrangler exists for this schema option, the _formatter_ will be executed
		first.
		
		The function takes the form
		
        function (key, value, action, payload)

		where

		* _key_ is the attribute in the schema
		* _value_ is the entry for the _key_ in the _payload_
		* _action_ is either _"fetch"_ or _"commit"_, where _"fetch"_ means the data
			was just fetched and _"commit"_ means the model is about to be committed
		* _payload_ is the mutable full dataset (coming in or going out)

		#### [_relation_](id:relation) - _Enum_

		TODO: While relationships do function, the API is considered volatile at
		present, and is only partially implemented in [enyo.Store](#enyo.Store).

		Relationships between schemas (models) are defined by supplying _relation
		options_ to the two known _relation types_, _enyo.toOne_ and _enyo.toMany_.
		These relation types are _functions_ that take your relation options and use
		them to create an appropriate handler for the relation.

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

		### [Relation Options](id:relation-options)

		#### [_autoFetch_](id:autoFetch) - _Boolean_ (default: true)

		When the incoming data for a particular relation is not included in the
		dataset and needs to be fetched separately, this relation option may be set
		to _true_. Sometimes it is desirable to postpone fetching for a relationship
		that is not included in the original payload; in such cases, _autoFetch_
		should be explicitly set to _false_.

		#### [_model_](id:model) - _Function (object constructor)_ or _String_

		This is the constructor or String placeholder for the constructor of the
		kind of model to use for this relation. If _model_ is supplied for an
		_enyo.toMany_ relation, it will use a generic _enyo.Collection_ with that
		model kind. If there is a custom collection kind, use the _collection_
		relation option (below) instead.

		#### [_collection_](id:collection) - _Function (object constructor)_ or _String_

		This is only used in _enyo.toMany_ relations; it will be ignored in
		_enyo.toOne_ relations. This constructor or String placeholder for the
		constructor of the kind of collection to use for this relation. When
		you supply a custom _collection kind_, that kind is responsible for being
		configured to use the correct model kind.

		#### [_inCommit_](id:inCommit) - _Boolean_ (default: false)

		Set this relation option to _true_ to include this relation in a commit
		payload to the source.

		#### [_inverseKey_](id:inverseKey) - _String_

		The string representing the key on the related model to designate the
		relationship (if any).

		#### [_relationKey_](id:relationKey) - _String_ (default: "id")

		The string representing the key on this model to compare against the
		_inverseKey_ (if any).

		#### [_isOwner_](id:isOwner) - _Boolean_ (default: true)

		In relationships, it is important to indicate the _direction of ownership_.
		The owner of the relationship will receive the change events of the related
		model(s), whereas the non-owner will not. Also note that, if _isOwner_ is
		_false_, the _inCommit_ option will be automatically set to _false_, even if
		it is explicitly set to _true_.

		---

		The following is an example of a completed _enyo.Model_ schema definition.
		Note that not every model will need to use all of these features.

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
                // direct mapping to a remote key, but combines two
                // remote keys into one locally, and on commit will
                // parse them and map them back to the appropriate
                // structure in the payload. here we have the method
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
			The defined schema for this model. If no schema is defined, the model will
			attempt to infer the schema from the structure of the data passed to it at
			creation time.
		*/
		attributes: null,

		//*@public
		/**
			The hash of default values to be supplied to the model upon instantiation.
			When no schema (attributes) are explicitly defined, but defaults are, the
			schema will be inferred from these properties. They consist of key-value
			pairs in which the value may be of any type, even a function. If the value
			is a function, it will be executed during initialization under the context
			of the model (as _this_) and is expected to return the default value for
			its assigned property.
		*/
		defaults: null,

		//*@public
		/**
			A static root for this particular model. In a system with a simple REST
			backend with a 1 to 1 mapping of client model to backend server/service,
			the _url_ could be of the form `/models/artist`. It may also be used in
			more complex scenarios. Note that this property is appended to the domain
			url generated by the _enyo.Source_ for the _enyo.Store_ of the current
			application. If the _noUrl_ property is set to false and no _url_ is
			specified, it will be automatically generated based on the name of the
			model kind.
		*/
		url: "",

		//*@public
		/**
			The _status_ of the model is defined by a fixed set of enumerated
			values. (See the documentation for _enyo.Model_ states).
		*/
		status: NEW,

		//*@public
		/**
			A simple Boolean flag indicating whether or not the current model	is a
			locally-created new record. Once a model has been committed (or fetched),
			this value will be false.
		*/
		isNew: true,

		//*@public
		/**
			String representing which attribute to use as the indexable
			primary key for this model. The default is _"id"_.
		*/
		primaryKey: "id",
		
		//*@public
		noFetchId: true,

		//*@public
		/**
			In some cases, correct remote calls are generated by some means other	than
			the normal url generation. In these cases, this Boolean flag needs to be
			set to true. The default is false.
		*/
		noUrl: false,
		
		//*@public
		/**
			For cases in which the _url_ is arbitrarily set and must be used as-is,
			set this flag to true. This setting will ignore the value of the _noUrl_
			property.
		*/
		rawUrl: false,
		
		//*@public
		/**
			In cases where the commit body should be a subset of the attributes
			explicitly or implicitly defined by the schema, set this property to
			an array of the keys that should be included. For a programmatic way
			of filtering payload data, use the _filterData()_ method and watch for
			the second parameter to be _commit_.
		*/
		includeKeys: null,

		//*@public
		/**
			_enyo.Model_ generates its own events. When a defined attribute of the
			model schema is modified, an event is fired to any listeners with a
			payload object containing the changeset in its _changed_ property, the
			previous values of the changeset in its _previous_ property, and a
			reference to the current model in the _model_ property.

			When the model is destroyed, an event is fired with a payload object
			containing a reference to the current model in its _model_ property (even
			though it has already been destroyed).
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
			Assigned by an _enyo.Store_ at model instantiation. A unique identifier
			used for indexing, but which may also be used for local-only data instead
			of creating a unique id.
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
			Used internally by _enyo.Source_ to generate an appropriate request url.
			Overload this method in custom setups.
		*/
		query: enyo.computed(function () {
			return !this.noUrl && !this.rawUrl? this.get("url") + "/" + this.get(this.primaryKey) || "": this.rawUrl? this.get("url"): "";
		}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Overload this method to conditionally mutate data for incoming and
			outgoing payloads. The _data_ parameter is the data to be mutated. The
			value of _direction_ will be either _"fetch"_ or "commit", denoting
			incoming and outgoing data, respectively. Returns the data presented to
			the _didFetch()_ method and the payload included in commits, when
			appropriate.
		*/
		filterData: function (data, direction) {
			return data;
		},

		//*@public
		/**
			When the _enyo.Source_ is constructing the request for this model
			(regardless of the action), it calls this method. You may overload the
			method to add custom parameters to the _queryParams_ hash of the
			_options_ parameter. These parameters are key-value pairs used to generate
			the options in a query string in default setups. They may also be used for
			other purposes in overloaded and custom setups.
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
			Executes a commit of the model's current state. The optional _options_
			hash may include _success()_ and/or _error()_ methods, to be executed
			asynchronously in response to the respective results.
		*/
		commit: function (options) {
			var $options = options? enyo.clone(options): {};
			this.set("status", BUSY.COMMITTING);
			$options.postBody = this.filterData(this.raw(), "commit");
			this.exec("commit", $options);
		},

		//*@public
		/**
			Executes a fetch. The optional _options_ hash may include _success()_
			and/or _error()_ methods, to be executed asynchronously in response to the
			respective results.
		*/
		fetch: function (options) {
			this.set("status", BUSY.FETCHING);
			this.exec("fetch", options);
			this.__hasFetched = true;
		},

		//*@public
		/**
			Executes a destroy operation that destroys the model in the client and
			also (by default) sends a _DELETE_ request to the source. The optional
			_options_ hash may include _success()_ and/or _error()_ methods, to be
			executed asynchronously in response to the respective results.
		*/
		destroy: function (options) {
			this.set("status", BUSY.DESTROYING);
			this.exec("destroy", options);
		},

		//*@public
		/**
			This method should not be executed directly, but may be overloaded in
			custom setups.
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
			This method should not be executed directly, but may be overloaded in
			custom setups. Note that many of the details of this implementation
			are needed to make models work properly; great care should be taken when
			making modifications, or you may encounter unexpected or unpredictable
			results. Set the third parameter to true if you do not want the result to
			be passed through the filter.
		*/
		didFetch: function (options, result, noFilter) {
			var $o = enyo.pool.claimObject(true);
			var $d = noFilter? (result || $o): this.filterData(result || $o, "fetch");
			var $g = this.defaults;
			var $k = enyo.merge(enyo.keys($d), enyo.keys($g));
			this.silence();
			this.stopNotifications();
			// if we haven't fetched before, we will run the data through the schema
			// generator to ensure we have the full schema from the data structure,
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
					// queue any relation actions until the rest have been completed
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
			This method should not be executed directly, but may be overloaded in
			custom setups.
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
			This method should not be executed directly, but may be overloaded in
			custom setups.
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
			This method should not be executed directly, but may be overloaded in
			custom setups. The _action_ parameter will be one of _"fetch"_,
			_"destroy"_, _"commit"_, or _"update"_, depending on which action failed.
		*/
		didFail: function (action, options, result) {
			this.set("status", ERROR.RESPONSE);
			if (options && options.error) {
				options.error(result, this, options);
			}
		},

		//*@public
		/**
			Returns an _Object_ literal that represents the JSON-parseable form
			of the model in its current state. Takes an optional Boolean parameter
			that, if true, returns the hash with local (client) keys, but defaults to
			remote keys if they are defined, such that it could be used as a payload
			to the source. If no remote keys are defined, defaults to using the local
			(client) keys.
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
			Returns the JSON parsed string value for this model in its current state,
			as would be appropriate to send in a payload to the source.	If the
			optional _local_ parameter is true, returns with local keys instead of
			remote keys (if any).
		*/
		toJSON: function (local) {
			return enyo.json.stringify(this.raw(local));
		},

		//*@public
		/**
			Returns Boolean true or false indicating whether the passed-in property
			is an attribute of the schema for this model.
		*/
		isAttribute: function (prop) {
			return !!~enyo.indexOf(prop, this.__attributeKeys);
		},

		//*@public
		/**
			Returns Boolean true or false indicating whether the passed-in property
			is known by the model schema as a remoteKey.
		*/
		isRemoteAttribute: function (prop) {
			return prop in this.__remoteKeys;
		},

		//*@public
		/**
			Returns Boolean true or false indicating whether or not the passed-in
			property is a relation.
		*/
		isRelation: function (prop) {
			return !! (prop in this.__relations);
		},

		//*@public
		/**
			Retrieves the previous value for the passed-in property (when it exists).
		*/
		previous: function (prop) {
			return this.__previous[prop];
		},

		//*@public
		/**
			This is a specially overloaded version of _enyo.Object.set()_. It accepts
			either a hash or a string and value combined as its parameters.
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
			Used to set values for a given (and defined) relation for an attribute of
			the schema. Do not call this method directly. It may be overloaded in
			non-standard use cases.
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
			internal (protected) properties, but is also responsible for
			determining whether the _schema_ is defined and, if not,
			attempting to derive it implicitly from the passed-in values.
			If there is no schema defined and no initial _values_ are passed in,
			much of its functionality will not work as intended.
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
			// which case it is, we catch errors and use the original structure if
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
			will receive any events propagated from this model.
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
			Used internally to remove registered collections from the model.
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
			Used at the appropriate time to emit an _onChange_ event with the
			changeset, previous values, and a reference to the model that changed
			(this model).
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
			Retrieves the attribute object for a given attribute property
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
			the model. Calls _flushChanges()_, which will emit an _onChange_
			event if the model isn't currently silenced.
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