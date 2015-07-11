// plugin that figures out which prefixes are missing from a ruleset
// and adds the missing prefixes to the rule set without duplicating
;(function() {

    //prefixes that will be looked for and applied
    var
        prefixes = [],
        agents = [
            'chrome',
            'firefox',
            'safari',
            'ie',
            'opera'
        ];

    //pack caniuse data with this module
    var data = require('../node_modules/caniuse-db/data.json');
    var metaData = require('./metaData');

    //for browser support
    var less;
    if (typeof window != 'undefined') {
        less = window.less;
    } else {
        //walk around browserify trying to include 
        //the native node module
        var s_less = 'less';
        less = require(s_less);
    }

    //set prefixly options
    var prefixly = function(opts) {

        opts = opts || {};

        function buildPrefixList() {
            //gets the preferred list of agents
            //and translates them into a list of
            //prefixes to match rules against
            for (var i = 0; i < agents.length; i++) {
                var agent = agents[i],
                    prefix = '-' + data.agents[agent].prefix;

                if (prefixes.indexOf(prefix) == -1) {
                    prefixes.push(prefix);
                }
            }
        }

        //init plugin
        this.configure(opts);
        buildPrefixList();

    };

    //prefixly
    prefixly.prototype = {

        /**
         * Entry point
         */
        run: function(root) {
            this._visitor = this._visitor || new less.tree.visitor(this);
            return this._visitor.visit(root);
        },

        /**
         * Updates the parameters for this plugin based on a set of options
         *
         * @param {Object} opts - A hash of options.
         * @public
         */
        configure: function(opts) {
            agents = opts.agents || agents;
        },

        /*
         * Hook into each rule node
         *
         * @private
         */
        visitRuleset: function(rulesetNode, visitArgs) {
            if (rulesetNode.root) {
                //if this is a root ruleset, then return
                return;
            }

            var ruleMap = {};

            generateRuleMap(rulesetNode, ruleMap);
            generateRuleSet(rulesetNode, ruleMap);
        }

    };

    function isPrefixed(rule) {
        //check if the property is prefixed
        var prefixed = false;

        //get the prefix from the prop
        var prefix = getPropPrefix(rule);

        //check to see if it's in our list of prefixes
        if (prefixes.indexOf(prefix) > -1) {
            prefixed = true;
        }

        //return if prefixed
        return prefixed;
    }

    function canBePrefixed(rule) {
        //check if the property can be prefixed
        var canprefixed = false;

        //check to see if the vanilla name is
        //in our list of possible prefixed properties
        if (data.data[rule.name]) {
            canprefixed = true;
        } else {
            if (metaData[rule.name]) {
                canprefixed = true;
            }
        }

        //return if it can be prefixed
        return canprefixed;
    }

    function getNomalizedProp(rule) {
        //remove the vendor prefix from the rule
        if (isPrefixed(rule)) {
            //remove the the vendor prefix is one is present
            var nameArr = rule.name.split('-');
            nameArr.splice(0, 2);
            return nameArr.join('-');
        } else {
            //otherwise just return the vanilla name
            return rule.name;
        }
    }

    function getPropPrefix(rule) {
        //return the values where the vendor prefix is
        //use when you know you are dealing with a prefixed value
        //otherwise use isPrefixed to check against known prefixes
        var nameArr = rule.name.split('-');
        var prefix = nameArr.splice(0, 2);
        return prefix.join('-');
    }

    function normalizeRule(rule, ruleMap) {

        //normalize the rule, and map the rule
        var normalizedName = getNomalizedProp(rule),
            propPrefix = getPropPrefix(rule);

        if (normalizedName.length > 0) {
            //ruleMap['font-kerning']
            ruleMap[normalizedName] = ruleMap[normalizedName] || {
                rule: rule //we need this for copying later
            };

            //ruleMap['font-kerning']['-webkit']
            ruleMap[normalizedName][propPrefix] = true;
        }
    }

    function generateRuleMap(rulesetNode, ruleMap) {

        //loop through all the rules in this set, and gather
        //information about them, we will map prefixed rules
        for (var i = 0; i < rulesetNode.rules.length; i++) {

            //loop through the rules, and check the node names
            var rule = rulesetNode.rules[i];
            if (rule) {

                //if a rule is available, and is one of our prefixed tags
                //check to see if we need to normalize and if so do it.
                if (rule.name && isPrefixed(rule)) {
                    //we know we need to normalize now
                    normalizeRule(rule, ruleMap);
                }


                if (rule.name) {
                    var name = getNomalizedProp(rule);

                    //if the rule is an unprefixed known prefixed rule
                    if (name.length > 0 && canBePrefixed(rule)) {
						
						console.log(data.data[name], rule);
						
                        //get the rule map, or create the rule map
                        ruleMap[name] = ruleMap[name] || {
                            rule: rule
                        };

                        //add that the unprefixed rule already exists
                        //console.log(name, 'unprefix');
                        ruleMap[name].unprefix = true;
                    }
                }
            }
        }
    }

    function generateRuleSet(rulesetNode, ruleMap) {

        //loop through out prefix map, and append rules we need
        //to the rule map
        for (var prop in ruleMap) {
            if (ruleMap.hasOwnProperty(prop)) {

                //determine which prefixes for the rule we need to
                //generate
                for (var i = 0; i < prefixes.length; i++) {
                    //if the prefix doesn't exist in the map
                    //it needs to be generated
                    if (!ruleMap[prop][prefixes[i]]) {
                        //create a new rule and push to rule set
                        var newRule = Object.create(ruleMap[prop].rule);
                        newRule.name = prefixes[i] + '-' + prop;
                        rulesetNode.rules.push(newRule);
                    }
                }

                if (typeof ruleMap[prop].unprefix == 'undefined') {
                    //check to see if we found an unprefixed rule
                    //if not, add an unprefixed rule
                    var newRule = Object.create(ruleMap[prop].rule);
                    newRule.name = prop;
                    rulesetNode.rules.push(newRule);
                }
            }
        }
    }

    if (typeof window != 'undefined') {
        //export to window so the plugin can
        //be used in browser.
        window.enyoLessPrefixlyPlugin = prefixly;
    } else {
        //if the plugin is running under node
        //export back
        module.exports = prefixly;
    }

}());