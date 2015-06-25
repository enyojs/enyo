// plugin that figures out which prefixes are missing from a ruleset
// and adds the missing prefixes to the rule set without duplicating
;
(function() {

	//prefixes that will be looked for and applied
    var
        prefixes = [
            '-webkit',
            '-moz',
            '-o',
            '-ms'
        ];

	//properties normally prefixed
    var
        prefixed = [
            'align-content',
            'align-items',
            'align-self',
            'animation',
            'animation-delay',
            'animation-direction',
            'animation-duration',
            'animation-fill-mode',
            'animation-iteration-count',
            'animation-name',
            'animation-play-state',
            'animation-timing-function',
            'app-region',
            'appearance',
            'aspect-ratio',
            'backface-visibility',
            'background-clip',
            'background-composite',
            'background-origin',
            'background-size',
            'border-after',
            'border-after-color',
            'border-after-style',
            'border-after-width',
            'border-before',
            'border-before-color',
            'border-before-style',
            'border-before-width',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-end',
            'border-end-color',
            'border-end-style',
            'border-end-width',
            'border-fit',
            'border-horizontal-spacing',
            'border-image',
            'border-radius',
            'border-start',
            'border-start-color',
            'border-start-style',
            'border-start-width',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-vertical-spacing',
            'box-align',
            'box-decoration-break',
            'box-direction',
            'box-flex',
            'box-flex-group',
            'box-lines',
            'box-ordinal-group',
            'box-orient',
            'box-pack',
            'box-reflect',
            'box-shadow',
            'box-sizing', 
            'clip-path',
            'column-break-after',
            'column-break-before',
            'column-break-inside',
            'column-count',
            'column-gap',
            'column-rule',
            'column-rule-color',
            'column-rule-style',
            'column-rule-width',
            'column-span',
            'column-width',
            'columns',
            'filter',
            'flex',
            'flex-basis',
            'flex-direction',
            'flex-flow',
            'flex-grow',
            'flex-shrink',
            'flex-wrap',
            'font-feature-settings',
            'font-size-delta',
            'font-smoothing',
			'font-kerning',
            'highlight',
            'hyphenate-character',
            'justify-content',
            'line-box-contain',
            'line-break',
            'line-clamp',
            'locale',
            'logical-height',
            'logical-width',
            'margin-after',
            'margin-after-collapse',
            'margin-before',
            'margin-before-collapse',
            'margin-bottom-collapse',
            'margin-collapse',
            'margin-end',
            'margin-start',
            'margin-top-collapse',
            'mask',
            'mask-box-image',
            'mask-box-image-outset',
            'mask-box-image-repeat',
            'mask-box-image-slice',
            'mask-box-image-source',
            'mask-box-image-width',
            'mask-clip',
            'mask-composite',
            'mask-image',
            'mask-origin',
            'mask-position',
            'mask-position-x',
            'mask-position-y',
            'mask-repeat',
            'mask-repeat-x',
            'mask-repeat-y',
            'mask-size',
            'max-logical-height',
            'max-logical-width',
            'min-logical-height',
            'min-logical-width',
            'opacity',
            'order',
            'padding-after',
            'padding-before',
            'padding-end',
            'padding-start',
            'perspective',
            'perspective-origin',
            'perspective-origin-x',
            'perspective-origin-y',
            'print-color-adjust',
            'rtl-ordering',
            'ruby-position',
            'shape-image-threshold',
            'shape-margin',
            'shape-outside',
            'tap-highlight-color',
            'text-combine',
            'text-decorations-in-effect',
            'text-emphasis',
            'text-emphasis-color',
            'text-emphasis-position',
            'text-emphasis-style',
            'text-fill-color',
            'text-orientation',
            'text-security',
            'text-stroke',
            'text-stroke-color',
            'text-stroke-width',
            'transform',
            'transform-origin',
            'transform-origin-x',
            'transform-origin-y',
            'transform-origin-z',
            'transform-style',
            'transition',
            'transition-delay',
            'transition-duration',
            'transition-property',
            'transition-timing-function',
            'user-drag',
            'user-modify',
            'user-select',
            'writing-mode'
        ];

	//for browser support
    var less;
    if (typeof window != 'undefined') {
        less = window.less || {};
    } else {
        less = require("less");
    }

	//set prefixly options
    var prefixly = function(opts) {

    };

	//prefixly
    prefixly.prototype = {

        /*
         * Entry point
         */
        run: function(root) {
            this._visitor = this._visitor || new less.tree.visitor(this);
            return this._visitor.visit(root);
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

            var ruleMap = {

            };

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
        if(prefixes.indexOf(prefix) > -1){
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
		if(prefixed.indexOf(rule.name) > -1){
			canprefixed = true;	
		}
		
		//console.log('canPrefix:', rule.name, canprefixed);
		//return if it can be prefixed
        return canprefixed;
    }

    function getNomalizedProp(rule) {
        //remove the vendor prefix from the rule
		if(isPrefixed(rule)){
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
				if(rule.name) {
					
				//console.log('is Prefixed', rule.name, isPrefixed(rule));	
				}
				
                if (rule.name && isPrefixed(rule)) {
                    //we know we need to normalize now
                    normalizeRule(rule, ruleMap);
                }
				
				
				 if (rule.name){
					var name = getNomalizedProp(rule);
					 
					//if the rule is an unprefixed known prefixed rule
					if (name.length > 0 && canBePrefixed(rule)) {
						
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
        window.enyoLessPrefixlyPlugin = prefixly;
    } else {
        module.exports = prefixly;
    }

}());