(function (enyo, scope) {

	if (scope.localStorage || scope.sessionStorage) {
		var kind = enyo.kind
			, json = enyo.json
			, uuid = enyo.uuid;
	
		var Source = enyo.Source
			, Collection = enyo.Collection
			, Model = enyo.Model;
			
		var CODES = {
			UNIQUE_URL: 'A Collection must have a unique url property when using a Web Storage',
			UNIQUE_PRIMARY_KEY: 'A Model must have a unqiue primaryKey to be able to fetch it from a Web Storage'
		};
	
		/**
		* A [localStorage]{@glossary localStorage}
		* or [sessionStorage]{@glossary sessionStorage} [source]{@link enyo.Source}.
		* This [kind]{@glossary kind} is only an available on platforms that support the
		* Web Storage standard.
		*
		* It is important to note that usage of this source requires that
		* [models]{@link enyo.Model} and [collections]{@link enyo.Collection} use
		* their respective `url` properties ({@link enyo.Model.url} and
		* {@link enyo.Collection.url}). Any collection that needs to be
		* [committed]{@link enyo.Collection#commit} must have a unique `url` value.
		* Any model that will be [committed]{@link enyo.Model#commit} directly, or
		* within an {@link enyo.Collection}, must have a unique
		* [primaryKey]{@link enyo.Model#primaryKey}.
		*
		* @class enyo.WebStorageSource
		* @extends enyo.Source
		* @public
		*/
		kind(
			/** @lends enyo.WebStorageSource.prototype */ {
			
			/**
			* @private
			*/
			name: 'enyo.WebStorageSource',
			
			/**
			* @private
			*/
			kind: Source,
			
			/**
			* @private
			*/
			noDefer: true,
			
			/**
			* The namespace of all [models]{@link enyo.Model} and
			* [collections]{@link enyo.Collection} that will be stored by this
			* {@link enyo.WebStorageSource}.
			*
			* @type {String}
			* @default 'enyo-app'
			* @public
			*/
			prefix: 'enyo-app',
			
			/**
			* The type of the store. Can be local or session.
			* @type {String}
			* @default 'local'
			* @public
			*/
			storageType: 'local',

			/**
			* @public
			*/
			constructor: function () {
				this.inherited(arguments);
				this.webStorage = scope[this.storageType+'Storage'];
			},

			/**
			* @private
			*/
			storage: function () {
				var webStorage = this.webStorage;
				return this._storage || (this._storage = (function (source) {
					// try and acquire any previously stored uuids
					var storage = webStorage.getItem(source.prefix);
					
					// if there was anything in the store we turn it into an array temporarily
					if (typeof storage == 'string') storage = storage.split(',');
					if (storage) storage = source.unpack(storage);
				
					return storage || {uuids: [], collections: {}, models: {}};
				})(this));
			},
			
			/**
			* Implementation of {@link enyo.Source.fetch}.
			*
			* @see enyo.Source.fetch
			* @public
			*/
			fetch: function (model, opts) {
				var storage = this.storage(), id, res;
				
				if (model instanceof Collection) {
					if (!(id = model.url)) throw new Error(CODES.UNIQUE_URL);
					res = storage.collections[id];
					
					// now we need to dereference these id's but note that even if these belonged to multiple
					// collections or have already been loaded into the store they should be found and merged
					// unless otherwise directed so this is safe
					if (res) {
						res = res.map(function (id) {
							return storage.models[id];
						});
					}
				}
				
				else if (model instanceof Model) {
					if (!(id = model.attributes[model.primaryKey])) throw new Error(CODES.UNIQUE_PRIMARY_KEY);
						
					res = storage.models[id];
				}
				
				// @TODO: For now it is assumed that there will never be a valid
				// 'error' to call when using local storage?
				opts.success(res);
			},
		
			/**
			* Implementation of {@link enyo.Source.commit}.
			*
			* @see enyo.Source.commit
			* @public
			*/
			commit: function (model, opts) {
				var storage = this.storage(), id;
				
				if (model instanceof Collection) {
					if (!(id = model.url)) throw new Error(CODES.UNIQUE_URL);
					storage.collections[id] = model.map(function (model) {
						// @TODO: Currently it seems that in this arbitrary assignment case there is no need
						return model.attributes[model.primaryKey] || (model.attributes[model.primaryKey] = uuid());
					});
				}
				
				else if (model instanceof Model) {
					// we automatically assign a uuid here to ensure that it will be commited in a trackable way
					if (!(id = model.attributes[model.primaryKey])) id = (model.attributes[model.primaryKey] = uuid());
					
					storage.models[id] = model.raw();
				}
				
				if (storage.uuids.indexOf(id) === -1) storage.uuids.push(id);
				
				this.save(id);
				opts.success();
			},
			
			/**
			* Implementation of {@link enyo.Source.destroy}.
			*
			* @see enyo.Source.destroy
			* @public
			*/
			destroy: function (model, opts) {
				var storage = this.storage(), id, idx;
				
				if (model instanceof Collection) {
					if (!(id = model.url)) throw new Error(CODES.UNIQUE_URL);
					delete storage.collections[id];
				}
				
				else if (model instanceof Model) {
					if (!(id = model.attributes[model.primaryKey])) throw new Error(CODES.UNIQUE_PRIMARY_KEY);
					delete storage.models[id];
				}
				
				idx = storage.uuids.indexOf(id);
				idx > -1 && storage.uuids.splice(idx, 1);
				
				this.save(id);
				opts.success();
			},
		
			/**
			* Not implemented.
			*
			* @public
			*/
			find: function (ctor, opts) {
				// needs to be implemented
			},
			
			/**
			* @private
			*/
			save: function (uuid) {
				var storage = this.storage()
					, prefix = this.prefix
					, webStorage = this.webStorage;
					
				var fn = function (uuid) {
					var key = (prefix + '-' + uuid)
						, model = storage.models[uuid]
						, collection = storage.collections[uuid];
					if (model || collection) webStorage.setItem(key, json.stringify({model: !! model, collection: !! collection, data: model || collection}));
					else webStorage.removeItem(key);
				};
				
				// if a uuid is provided we only have to save a subset of the whole
				if (uuid) fn(uuid);
				
				
				else {
					['collections', 'models'].forEach(function (key) {
						Object.keys(storage[key]).forEach(fn);
					});
				}
				
				// we always update the overall array to ensure it is up-to-date
				webStorage.setItem(prefix, storage.uuids.join(','));
			},
			
			/**
			* @private
			*/
			unpack: function (uuids) {
				var prefix = this.prefix
					, collections = {}
					, models = {}
					, storage = {uuids: uuids, models: models, collections: collections}
					, webStorage = this.webStorage;
					
				uuids.forEach(function (uuid) {
					var key = (prefix + '-' + uuid)
						, ln = webStorage.getItem(key);
					
					if (ln && typeof ln == 'string') {
						ln = json.parse(ln);
						
						if (ln.collection) collections[uuid] = ln.data;
						else if (ln.model) models[uuid] = ln.data;
					}
				});
				
				return storage;
			}
		});
	
	}
	
})(enyo, this);

