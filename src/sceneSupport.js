var
    kind = require('./kind'),
    scene = require('./scene');

var SceneSupport = {

    create: kind.inherit(function(sup) {
        var sctor;
        return function() {
            sup.apply(this, arguments);
            sctor = this.scene;
            if (sctor) {
                sctor = scene(this, sctor);
                this.scene = sctor;
            }
        };
    })
};

module.exports = SceneSupport;