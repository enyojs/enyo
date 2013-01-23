//*@public
/**
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ArrayController",
    
    //*@public
    kind: "enyo.Controller",
    
    //*@public
    length: 0,
   
    //*@public
    data: enyo.Computed(function (data) {
        if (0 < arguments.length) {
            this._array = data;
        } else return this._array;
    }),
   
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _array: null,
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // CUSTOM MUTATORS
    
    //*@public
    add: function (value, at) {
        var value = value.length? value: [value];
        var len = this.length;
        var idx = at && !isNaN(at) && at >= 0 && at < len? at: len;
        var args = [idx, 0].concat(value);
        this.splice.apply(this, args);
    },
    
    //*@public
    remove: function (value, index) {
        if (value instanceof Array) {
            var removed = {};
            var index;
            this.silence();
            removed.multiple = true;
            removed.value = {};
            for (var idx = 0, len = value.length; idx < len; ++idx) {
                index = this.indexOf(value[idx]);
                removed.value[index] = value[idx];
                this.remove(value[idx]);
            }
            
            this.unsilence();
            this.dispatchBubble("didremove", removed, this);
            return;
        }
        
        var idx = index || this.indexOf(value);
        if (!!~idx) {
            this.splice(idx, 1);
        }
    },
    
    //*@public
    reset: function () {
        
    },
    
    swap: function (index, to) {
        var data = this.get("data");
        var val1 = data[index];
        var val2 = data[to];
        data[index] = val2;
        data[to] = val1;
        this.silence();
        this.set("data", data);
        this.unsilence();
        this.dispatchBubble("didswap", {from: index, to: to}, this);
    },
    
    move: function (index, to) {
        this.silence();
        var value;
        var max = this.get("length")-1;
        if (max < index) index = max;
        if (0 > index) index = 0;
        if (max < to) to = max;
        if (0 > to) to = 0;
        
        value = this.at(index);
        
        if (max === index) this.pop();
        else this.splice(index, 1);
        if (0 === to) this.unshift(value);
        else this.splice(to, 0, value);
        
        this.unsilence();
        this.dispatchBubble("didmove", {from: index, to: to}, this);
    },
    
    
    //*@public
    contains: function (value) {
        return !!~enyo.indexOf(this.get("data"), value)? true: false;
    },

    //*@public
    at: function (index) {
        return this.get("data")[index];
    },
    
    // ...........................
    // ECMAScript

    //*@public
    push: function (value) {
        var data = this.get("data");
        var len = data.length;
        var ret = data.push(value);
        this.stopNotifications();
        this.set("data", data, this.comparator(len));
        this.update();
        this.startNotifications();
        this.dispatchBubble("didadd", {value: value, index: len}, this);
        return ret;
    },
    
    //*@public
    pop: function () {
        var data = this.get("data");
        var len = data.length;
        var ret = data.pop();
        this.stopNotifications();
        this.set("data", data, this.comparator(len));
        this.update();
        this.startNotifications();
        this.dispatchBubble("didremove", {value: ret, index: len-1}, this);
        return ret;
    },
    
    //*@public
    shift: function () {
        var data = this.get("data");
        var len = data.length;
        var ret = data.shift();
        this.stopNotifications();
        this.set("data", data, this.comparator(len));
        this.update();
        this.startNotifications();
        this.dispatchBubble("didremove", {value: ret, index: 0}, this);
        return ret;
    },
    
    //*@public
    unshift: function (value) {
        var data = this.get("data");
        var len = data.length;
        var ret = data.unshift(value);
        this.stopNotifications();
        this.set("data", data, this.comparator(len));
        this.update();
        this.startNotifications();
        this.dispatchBubble("didadd", {value: value, index: 0}, this);
        return ret;
    },
    

    //*@public
    /**
        Detects the presence of value in the array. Accepts an iterator
        and an optional context for that iterator to be called under. Will
        break and return if the iterator returns a truthy value otherwise
        it will return false. On truthy value it returns the value.
    */
    find: function (fn, context) {
        var idx = 0;
        var len = this.length;
        var val;
        for (; idx < len; ++idx) {
            val = this.at(idx);
            if (fn.call(context || this, val)) return val;
        }
        return false;
    },
    
    //*@public
    indexOf: function (value, start) {
        return enyo.indexOf(value, this.get("data"), start);
    },
    
    //*@public
    lastIndexOf: function (value, index) {
        return enyo.lastIndexOf(value, this.get("data"), index);
    },
    
    //*@public
    splice: function (index, many /* additional elements */) {
        var data = this.get("data");
        var len = data.length;
        var elems = enyo.toArray(arguments).slice(2);
        var many = many? many: 0;
        var start = index + many;
        var split = start === 0? null: [];
        var mod;
        var res;
        var idx;
        var max;
        var added;
        var removed;
        
        if (split) {
            split.push(data.slice(0, index));
            split.push(data.slice(start));
            mod = split[1];
        } else mod = data.slice(start);
        
        // reset len variable to the additional elements length
        // to be added to the dataset so we can reference it later
        len = elems.length;

        if (len) {
            added = {};
            if (1 < len) {
                added.multiple = true;
                added.value = {};
                for (idx = index, max = index + len; idx < max; ++idx) {
                    added.value[idx] = elems[idx - index];
                }
            } else {
                added.value = elems[0];
                added.index = start;
            }
        }
        
        if (many) {
            removed = {};
            if (1 < many) {
                removed.multiple = true;
                removed.value = {};
                for (idx = index, max = index + many; idx <= many; ++idx) {
                    removed.value[idx] = data[idx];
                }
            } else {
                removed.value = data[index];
                removed.index = index;
            }
            
        }

        // we need to add the elements (if any) to the array
        while (elems.length) {
            mod.unshift(elems.pop());
        }
        
        if (split) {
            res = split[0].concat(split[1]);
        } else res = mod;

        this.stopNotifications();
        this.set("data", res, true);
        this.update();
        this.startNotifications();

        if (added) {
            this.dispatchBubble("didadd", added, this);
        }
        
        if (removed) {
            this.dispatchBubble("didremove", removed, this);
        }
        
    },
    
    join: function (by) {
        var data = this.get("data");
        return data.join(by || "");
    },
    
    map: function () {
        
    },
    
    filter: function (fn, data) {
        return enyo.filter(data || this.get("data"), fn);
    },
    
    // ...........................
    // PROTECTED METHODS
     
    //*@protected
    create: function () {
        this._array = this._array || [];
        this.inherited(arguments);
    },
    
    //*@protected
    comparator: function (len) {
        return function (left, right) {
            return !(right.length === len);
        }
    },

    // ...........................
    // OBSERVERS METHODS
    
    //*@protected
    update: enyo.Observer(function () {
        this.set("length", this.get("data").length);
    }, "data")

});
