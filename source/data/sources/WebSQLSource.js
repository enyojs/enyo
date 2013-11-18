/**
 This class implements enyo.Source using underlying WebSQL.
 */
(function(enyo) {

    function failTemplate(rec, opts, e) {
        if(opts && typeof opts.fail === 'function') {
            opts.fail(rec, opts, e);
        } else {
            this.error(e);
        }
    }

    enyo.kind({
        name: 'enyo.WebSQLSource',
        kind: 'enyo.Source',

        /**
         Creates an instance of this class with given options object.
         Parameters:
            + _props.dbName_ Single required option, defining the database name.
            + _props.dbDisplayName_ Database display name, defaults to _props.dbName_.
            + _props.dbSize_ Database size in bytes, defaults to 1MB.
            + _props.dbVersion_ Database version, defaults to empty string.
            + _props.dbSchema_ optional string, containing schema creation or
              modification statements. For multiple statements, *separate* them
              with ';' character, i.e.

                create table A(...);
                create index iA on A(a);

            + _props.dbSchemaDidUpdate_ a callback to be invoked once schema has
              been created/updated. Will be called with an error object argument
              if schema update failed.


        Example:

            This code is to be run before application instance is created.

            try {
                var webSqlSrc = new enyo.WebSQLSource({
                    dbName: 'food',
                    dbSchema: MyApp.Resources.schema,
                    dbSchemaDidUpdate: function(e) {
                        if(e) {
                            enyo.error('Failed to create database schema:', e);
                        } else {
                            enyo.store.addSources({sql: webSqlSrc});
                            enyo.Signals.send('onDatabaseReady');
                            enyo.log('Created database schema');
                        }
                    }
                });

            } catch(e) {
                enyo.error(e && e.toString());
            }

            This will create(or open if it already exists) a database 'food'
            using SQL statements, provided in MyApp.Resources.schema string.

            In this example, MyApp.Resources is a singleton, containing application
            resources, such as database schema SQL statements.

            Once schema is created/updated, in this particular example, a special
            global 'onDatabaseReady' signal is sent such that the other parts of
            the app could make use of the data in the database.

            You can now save and retrieve your models using WebSQLSource source,
            registered under 'sql' name in this particular example. Further, in
            the following example, involving retrieving models from the database,
            it is assumed there is a table 'diet' in the database. The 'table'
            property indicates the table, which Collection is pupulated from.
            Note that you could use 'url' property instead for that same purpose
            as you subclass Collection and Model as well. The 'url' property
            could be your usual url, i.e. 'http://myserver.com/data' as long
            as 'data' at the end of the url is the database table where your
            'data' is.

            var data = new Collection();
            data.fetch({
                table: 'diet',
                source: 'sql'
            });

            this will work also:

            var data = new Collection();
            data.fetch({
                url: 'diet',
                source: 'sql'
            });

            and this

            enyo.kind({
                name: 'MyDiet',
                kind: 'enyo.Collection',
                url: 'http://w8management.com/diet'
            });

            var diets = new MyDiet();
            diets.fetch({source: 'sql'});

            Other Model/Collection CRUD methods work similarly.

            [See WebSQL spec for details](http://dev.w3.org/html5/webdatabase/#database)
         */
        constructor: enyo.inherit(function(sup) {
            return function(props) {
                var size = props.dbSize || 1024 * 1024, /* 1MB */
                    displayName = props.dbDisplayName || props.dbName,
                    version = props.dbVersion || '';

                if(typeof(openDatabase) !== 'function') {
                    throw "Web SQL database is not supported on this platform";
                }

                if(!props.dbName) {
                    throw "Database name is required";
                }

                this._db = openDatabase(props.dbName, version, displayName, size);

                if(props.dbSchema) {
                    enyo.WebSQLSource.updateSchema(this._db,
                                                   props.dbSchema,
                                                   props.dbSchemaDidUpdate);
                }

                sup.apply(this, arguments);
            }
        }),

        // enyo.Source interface implementation
        /**
            + _opts.table_      Provides table name. Optional, if not specified,
              then the table will be deduced from the model's 'url' property.
            + _opts.attributes_ Optional model attributes.
            + _opts.where_      Optional 'Where' clause. *DO NOT* include word
              'where'. Use '?' to specify arguments. See 'opt.args' also.
            + _opts.orderBy_    'Order By' clause. *DO NOT* include words
              'order by'
            + _opts.limit_      'limit' clause to limit number of rows, fetched
            + _opts.offset_     'offset' clause, see SQL spec for details
            + _opts.args_       An array of arguments to use in conjunction with
             '?' templates, specified in 'where' or elsewhere. The number of
             array elements must coincide with total number of '?' templates.
         */
        fetch: function (rec, opts) {
            var o = enyo.clone(opts) || {},
                sql = enyo.WebSQLSource.buildSelect(rec, o),
                fail = failTemplate.bind(this, rec, opts);

            if(this._debug) {
                this.log('[WebSQLSource.fetch]', sql);
            }

            this._db.readTransaction(function(t) { // transaction callback
                t.executeSql(sql, o.args, function(t, r) {
                    var res,
                        i,
                        rec,
                        l;
                    if(opts && typeof opts.success === 'function') {
                        l = r.rows.length;
                        res = new Array(l);
                        for(i = 0; i < l; ++i) {
                            rec = r.rows.item(i);
                            res[i] = rec;
                        }
                        opts.success(res);
                    }
                }, function(t, e) {
                    fail(e);
                });
            }, function(e) { // error callback
                fail(e);
            });
        },
        commit: function (rec, opts) {
            var o = enyo.clone(opts) || {},
                sql = rec.isNew ? enyo.WebSQLSource.buildInsert(rec, o)
                                : enyo.WebSQLSource.buildUpdate(rec, o),
                fail = failTemplate.bind(this, rec, opts);

            if(this._debug) {
                this.log('[WebSQLSource.commit]', sql);
            }

            this._db.transaction(function(t) {
                t.executeSql(sql, o.args, function(t, r) {
                    // We got now the value of a primary key attribute,
                    // update it now
                    if(rec.isNew) {
                        if(rec.primaryKey) {
                            rec.silence();
                            rec.set(rec.primaryKey, r.insertId);
                            rec.unsilence();
                        }
                    }
                    if(opts && typeof opts.success === 'function') {
                        opts.success();
                    }
                }, function(t, e) {
                    fail(e);
                });
            },
            function(e) {
                fail(e);
            });
        },
        destroy: function (rec, opts) {
            var o = enyo.clone(opts) || {},
                sql = enyo.WebSQLSource.buildDelete(rec, o),
                fail = failTemplate.bind(this, rec, opts);

            if(this._debug) {
                this.log('[WebSQLSource.destroy]', sql);
            }

            this._db.transaction(function(t) {
                t.executeSql(sql, o.args, function(t, r) {
                    if(opts && typeof opts.success === 'function') {
                        opts.success();
                    }
                }, function(t, e) {
                    fail(e);
                });
            },
            function(e) {
                fail(e);
            });
        },

        statics: {
            // Table name, attributes, primary key, etc
            extractSchema: function(rec, opts) {
                var schema = {},
                    url = rec.url || (opts && opts.url) || '';

                schema.table = url.split('/').pop() || (opts && opts.table);
                schema.attributes = (rec.attributes
                    && Object.keys(rec.attributes).filter(function(k) {
                        return !enyo.isFunction(rec.attributes[k]);
                    })) || [];

                // Figure attributes
                if(Array.isArray(opts.attributes)) {
                    opts.attributes.forEach(function(attr) {
                        if(schema.attributes.indexOf(attr) < 0) {
                            schema.attributes.push(attr);
                        }
                    })
                }

                schema.primaryKey = rec.primaryKey || opts.primaryKey;

                return schema;
            },
            buildSelect: function(rec, opts) {
                var schema = enyo.WebSQLSource.extractSchema(rec, opts),
                    id,
                    sql = ['select','*','from',null,'where',''],
                    args = Array.isArray(opts.args) ? opts.args : (opts.args = []);

                if(!schema.table) {
                    throw "Can't build select: No table";
                }
                sql[3] = '"' + schema.table + '"';

                if(schema.attributes.length !== 0) {
                    sql[1] = schema.attributes.map(function(a) {
                        return '"' + a + '"';
                    }).join();
                }

                if(opts.where) {
                    sql[5] = opts.where
                }

                if(schema.primaryKey) {
                    id = rec.get(schema.primaryKey);
                    if(typeof id !== 'undefined') {
                        sql[5] = sql[5].length > 0 ? (sql[5] + ' and ')
                            : '"' + schema.primaryKey + '"=?';
                        args.push(id);
                    }
                }

                // Delete 'where' clause if it is empty
                if(!sql[5]) {
                    sql = sql.slice(0, 4);
                }

                if(opts.orderBy) {
                    sql.push('order by', opts.orderBy);
                }

                if(opts.limit) {
                    sql.push('limit', opts.limit);
                }

                if(opts.offset) {
                    sql.push('offset', opts.offset);
                }

                return sql.join(' ');
            },
            buildInsert: function(rec, opts) {
                var schema = enyo.WebSQLSource.extractSchema(rec, opts),
                    sql = ['insert into', null, '(', null, ') values(', null,')'],
                    args = opts.args = [];

                if(!schema.table) {
                    throw "Can't build insert: no table defined in the schema: "+
                          JSON.stringify(schema);
                }

                sql[1] = '"' + schema.table + '"';
                if(schema.attributes.length !== 0) {
                    sql[3] = schema.attributes.map(function(a) {
                        args.push(rec.get(a));
                        return '"' + a + '"';
                    }).join();
                }

                sql[5] = schema.attributes.map(function() {return '?'}).join();

                return sql.join(' ');
            },
            buildUpdate: function(rec, opts) {
                var schema = enyo.WebSQLSource.extractSchema(rec, opts),
                    id,
                    sql = ['update', null, 'set', null, 'where', ''],
                    args = opts.args = [];

                if(!schema.table) {
                    throw "Can't build update: no table defined in the schema: " +
                          JSON.stringify(schema);
                }
                sql[1] = '"' + schema.table + '"';

                if(schema.attributes.length !== 0) {
                    sql[3] = schema.attributes.map(function(a) {
                        args.push(rec.get(a));
                        return '"' + a + '"=?';
                    }).join();
                }

                if(schema.primaryKey) {
                    id = rec.get(schema.primaryKey);
                    if(typeof id !== 'undefined') {
                        sql[5] = '"' + schema.primaryKey + '"=?';
                        args.push(id);
                    } else {
                        throw "Can't build update: no value for primary key found "+
                              "in the record: " + JSON.stringify(rec);
                    }
                } else {
                    throw "Can't build update: no primary key defined in the schema "+
                          ": " + JSON.stringify(schema);
                }

                return sql.join(' ');
            },
            buildDelete: function(rec, opts) {
                var schema = enyo.WebSQLSource.extractSchema(rec, opts),
                    id,
                    sql = ['delete from', null, 'where', ''],
                    args = opts.args = [];

                if(!schema.table) {
                    throw "Can't build delete: no table defined in the schema: " +
                          JSON.stringify(schema);
                }
                sql[1] = '"' + schema.table + '"';

                if(schema.primaryKey) {
                    id = rec.get(schema.primaryKey);
                    if(typeof id !== 'undefined') {
                        sql[3] = '"' + schema.primaryKey + '"=?';
                        args.push(id);
                    } else {
                        throw "Can't build delete: no value for primary key found "+
                              "in the record: " + JSON.stringify(rec);
                    }
                } else {
                    throw "Can't build delete: no primary key defined in the schema "+
                          ": " + JSON.stringify(schema);
                }

                return sql.join(' ');
            },

            updateSchema: function(db, schema, cb) {
                db.transaction(function(t) {
                    var statemens = schema.split(';');
                    (function executeStatement(statement) {
                        t.executeSql(statement, null, function(t, r) {
                            if(typeof cb === 'function'
                                && statemens.length == 0) {
                                cb();
                                return;
                            }
                            executeStatement(statemens.shift());
                        }, function(t, e) {
                            if(typeof cb === 'function') { cb(e); }
                        });
                    })(statemens.shift());

                },
                function(e) {
                    if(typeof cb === 'function') { cb(e); }
                });
            }
        }
    });
})(enyo);