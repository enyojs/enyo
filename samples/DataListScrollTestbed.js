(function (enyo, scope) {

    var TestMixin = {
        classes: 'enyo-unselectable',
        strategy: 'Native',
        strategies: {
            'Native' : {strategyKind: 'enyo.ScrollStrategy'},
            'Touch' : {strategyKind: 'enyo.TouchScrollStrategy'},
            'Translate' : {strategyKind: 'enyo.TranslateScrollStrategy'},
            'Translate (Optimized)' : {strategyKind: 'enyo.TranslateScrollStrategy', translateOptimized: true},
            'Transition' : {strategyKind: 'enyo.TransitionScrollStrategy'}
        },
        samples: {
            'DataList' : 'enyo.sample.DataListScrollTestbed',
            'DataGridList' : 'enyo.sample.DataGridListScrollTestbed'
        },
        addTestControls: function() {
            this.createComponent({
                style: 'position: absolute; top: 0; left: 0; right: 0; padding: 0.5em', defaultKind: 'enyo.Button', components: [
                    {kind: 'enyo.Select', onchange: 'sampleChanged', components: this.buildMenu('samples', 'sample')},
                    {kind: 'enyo.Select', onchange: 'strategyChanged', components: this.buildMenu('strategies', 'strategy')},
                    {content: 'Scroll to Random Pos', ontap: 'scrollToRandomPos'},
                    {content: 'Scroll to Top', ontap: 'scrollToTop'},
                    {content: 'Scroll to Bottom', ontap: 'scrollToBottom'},
                    {content: 'Scroll to Random Item', ontap: 'scrollToRandomItem'}
                ]
            });
        },
        scrollToRandomPos: function() {
            var max = this.s.getScrollBounds().maxTop,
                pos = Math.random() * max;
            this.s.scrollTo(0, pos);
        },
        scrollToTop: function() {
            this.s.scrollToTop();
        },
        scrollToBottom: function() {
            this.s.scrollToBottom();
        },
        scrollToRandomItem: function() {
            var n = this.r.collection.length,
                i = Math.floor(Math.random() * n);
            this.r.scrollToIndex(i);
        },
        create: enyo.inherit(function(sup) {
            return function() {
                var ov = {repeater: {scrollerOptions: this.strategies[this.strategy]}};
                this.kindComponents = enyo.Component.overrideComponents(this.kindComponents, ov, enyo.Control);
                sup.apply(this,arguments);
                this.r = this.$.repeater;
                this.s = this.r.$.scroller;
                // global reference for easier console testing
                window._sample = this;
                //hack
                if (this.strategy == 'Translate (Optimized)') {
                    this.s.$.strategy.translateOptimized = true;
                }
                this.addTestControls();
            };
        }),
        strategyChanged: function(sender, event) {
            this.rebuild({strategy: event.originator.value});
        },
        sampleChanged: function(sender, event) {
            this.rebuild({strategy: this.strategy}, this.samples[event.originator.value]);
        },
        rebuild: function(props, kindName) {
            var pn = this.hasNode().parentNode, Ctor = enyo.constructorForKind(kindName || this.kindName);
            this.destroy();
            new Ctor(props).renderInto(pn);
        },
        buildMenu: function(opts, val) {
            var ss = Object.keys(this[opts]), c = [], i, s;
            for (i = 0; !!(s = ss[i]); i++) {
                c.push({content: s, selected: s == this[val]});
            }
            return c;
        }
    };

    enyo.kind({
        name: 'enyo.sample.DataListScrollTestbed',
        kind: 'enyo.sample.DataListSample',
        sample: 'DataList',
        mixins: [TestMixin]
    });

    enyo.kind({
        name: 'enyo.sample.DataGridListScrollTestbed',
        kind: 'enyo.sample.DataGridListSample',
        sample: 'DataGridList',
        mixins: [TestMixin]
    });

})(enyo, this);