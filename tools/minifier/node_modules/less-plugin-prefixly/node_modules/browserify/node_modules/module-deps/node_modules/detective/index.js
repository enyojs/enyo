var aparse = require('acorn').parse;
var escodegen = require('escodegen');
var defined = require('defined');

var requireRe = /\brequire\b/;

function parse (src, opts) {
    if (!opts) opts = {};
    return aparse(src, {
        ecmaVersion: defined(opts.ecmaVersion, 6),
        sourceType: opts.sourceType,
        ranges: defined(opts.ranges, opts.range),
        locations: defined(opts.locations, opts.loc),
        allowReserved: defined(opts.allowReserved, true),
        allowReturnOutsideFunction: defined(
            opts.allowReturnOutsideFunction, true
        ),
        allowHashBang: defined(opts.allowHashBang, true)
    });
}

var traverse = function (node, cb) {
    if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) {
            if (node[i] != null) {
                node[i].parent = node;
                traverse(node[i], cb);
            }
        }
    }
    else if (node && typeof node === 'object') {
        cb(node);
        for (var key in node) {
            if (!node.hasOwnProperty(key)) continue;
            if (key === 'parent' || !node[key]) continue;
            node[key].parent = node;
            traverse(node[key], cb);
        }
    }
};

var walk = function (src, opts, cb) {
    var ast = parse(src, opts);
    traverse(ast, cb);
};

var exports = module.exports = function (src, opts) {
    return exports.find(src, opts).strings;
};

exports.find = function (src, opts) {
    if (!opts) opts = {};
    
    var word = opts.word === undefined ? 'require' : opts.word;
    if (typeof src !== 'string') src = String(src);
    
    var isRequire = opts.isRequire || function (node) {
        var c = node.callee;
        return c
            && node.type === 'CallExpression'
            && c.type === 'Identifier'
            && c.name === word
        ;
    }
    
    var modules = { strings : [], expressions : [] };
    if (opts.nodes) modules.nodes = [];
    
    var wordRe = word === 'require' ? requireRe : RegExp('\\b' + word + '\\b');
    if (!wordRe.test(src)) return modules;
    
    walk(src, opts.parse, function (node) {
        if (!isRequire(node)) return;
        if (node.arguments.length) {
            if (node.arguments[0].type === 'Literal') {
                modules.strings.push(node.arguments[0].value);
            }
            else {
                modules.expressions.push(escodegen.generate(node.arguments[0]));
            }
        }
        if (opts.nodes) modules.nodes.push(node);
    });
    
    return modules;
};
