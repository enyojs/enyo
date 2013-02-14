//*@public
/**
    The base class for all controllers in enyo. The _enyo.Controller_
    is a delegate/component that is designed to be a proxy of information.
    Rarely will it be necessary or useful to use this base-kind of controller
    and far more likely to need _enyo.ArrayController_ or subclasses.
*/
enyo.kind({
    //*@public
    name: "enyo.Controller",
    //*@protected
    // we inherit from component because we need to be able to use the bubble
    // and waterfall systems
    kind: "enyo.Component",
    //*@protected
    mixins: ["enyo.MultipleDispatchSupport"],
    //*@public
    /**
        For all _enyo.Controller_s and subkinds the default source of information
        is the _data_ property. In some cases this is a computed property for
        easier overloading. Can be any type of data.
    */
    data: null,
    //*@protected
    create: function () {
        this.inherited(arguments);
        // make sure we have some type of id
        this.id = this.makeId();
    },
    //*@protected
    ownerChanged: function () {
        this.refreshBindings();
    },
    //*@protected
    /**
        Typically controllers don't wish to bubble (component-owned controllers)
        but controllers with multiple event targets might.
    */
    _controller_bubble_target: null,
    //*@public
    /**
        The preferred retreival mechanism for the _bubbleTargeT_ for
        events.
    */
    bubbleTarget: enyo.Computed(function () {
        return this.get("_controller_bubble_target");
    }, "_controller_bubble_target")
});
