var
    kind = require('./kind'),
    scene = require('./scene');

var SceneSupport = {

    create: kind.inherit(function(sup) {
        var ctor, proto, sctor;
        return function() {
            sup.apply(this, arguments);

            if (this.scene) {
                sctor = new scene(this, this.scene);
                this.scene = sctor;
            }
        };
    })
};

module.exports = SceneSupport;
