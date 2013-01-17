
//*@public
/**
    The Array controller is a proxy for array-like content. It
    has a normalized API for array functionality with the exception
    of the `[` and `]` operators (limitation of the language). Use
    of this kind allows one to have an array of data but also bind
    and observe as a normal _enyo.kind_ is also able to be abstracted
    further.
    
    Events are emitted for any add/remove actions. The events are
    _didadd_ for the _push_ and _unshift_ operations and _didremove_
    for the _pop_ and _shift_ operations.
    
    TODO: There are currently many methods missing in this partial
    implementation.
*/
enyo.kind({
    //*@public
    name: "enyo.ArrayController",
    //*@protected
    kind: "enyo.Controller",
    //*@public
    length: 0,
    //*@protected
    create: function () {
        this.array = this.array || [];
        this.inherited(arguments);
    },
    //*@public
    data: enyo.Computed(function (data) {
        if (data) {
            this.data = data;
        } else return this.array;
    }),
    //*@public
    push: function (value) {
        var data = this.get("data");
        var len = data.length;
        var ret = data.push(value);
        this.stopNotifications();
        this.set("data", data, this.comparator(len));
        this.update();
        this.startNotifications();
        this.dispatchBubble("didadd", {value: value}, this);
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
        this.dispatchBubble("didremove", {value: ret}, this);
        return ret;
    },
    //*@public
    contains: function (value) {
        return !~enyo.indexOf(this.get("data"), value)? true: false;
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
        this.dispatchBubble("didremove", {value: ret}, this);
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
        this.dispatchBubble("didadd", {value: value}, this);
        return ret;
    },
    //*@public
    at: function (index) {
        return this.get("data")[index];
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
    indexOf: function (value) {
        return enyo.indexOf(this.get("data"), value);
    },
    //*@public
    lastIndexOf: function (value) {
        return enyo.lastIndexOf(value, this.get("data"));
    },
    //*@public
    splice: function () {
        var data = this.get("data");
        var len = data.length;
        data.splice.apply(data, arguments);
        this.stopNotifications();
        this.set("data", data, this.comparator(len));
        this.update();
        this.startNotifications();
    },
    //*@protected
    update: enyo.Observer(function () {
        this.set("length", this.get("data").length);
    }, "data"),
    //*@protected
    comparator: function (len) {
        return function (left, right) {
            return !(right.length === len);
        }
    }
});
