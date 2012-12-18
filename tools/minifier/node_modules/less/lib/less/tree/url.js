(function (tree) {

tree.URL = function (val, paths) {
    this.value = val;
    this.paths = paths;
};
tree.URL.prototype = {
    toCSS: function () {
        return "url(" + this.value.toCSS() + ")";
    },
    eval: function (ctx) {
        var val = this.value.eval(ctx);

        // Add the base path if the URL is relative and we are either 
        //  a.) in the browser or 
        //  b.) we have a relative file URL
        if ((this.paths.length > 0) && 
        	(typeof window !== 'undefined' || !/^(?:[A-Za-z-]+:|\/)/.test(this.paths[0])) && 
        	(typeof val.value === "string" && !/^(?:[a-z-]+:|\/)/.test(val.value))) {
        	var path = this.paths[0].slice(-1) === '/' ? this.paths[0] : this.paths[0] + '/';
        	var v = path + (val.value.charAt(0) === '/' ? val.value.slice(1) : val.value);
        	val = new(tree.Anonymous)(v);
        }

        return new(tree.URL)(val, this.paths);
    }
};

})(require('../tree'));
