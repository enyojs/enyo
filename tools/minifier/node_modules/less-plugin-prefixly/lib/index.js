var prefixly = require("./prefixly");

module.exports = {
    install: function(less, pluginManager) {
        var pfx = new prefixly(less);
        pluginManager.addVisitor(pfx);
    }
};
