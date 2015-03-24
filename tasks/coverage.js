// istanbul coverage tasks -- inspired by istanbul-middleware

module.exports = function(grunt) {
	grunt.registerTask('coverage', function() {
		var istanbul = require('istanbul'),
			instrumenter = new istanbul.Instrumenter({}),
			utils = istanbul.utils,
			Report = istanbul.Report,
			express = require('express'),
			bodyParser = require('body-parser'),
			url = require('url'),
			path = require('path'),
			fs = require('fs'),
			app = express();

		function instrumentRequest(req, res, next) {
			var filepath = url.parse(req.url).pathname;
			if(filepath[0] == '/') {
				filepath = filepath.substr(1);
			}
			if(!filepath.match(/^source\/.*.js$/)) {		// Only instrument enyo source
				console.warn(filepath);
				return next();
			}
			filepath = path.resolve(process.cwd(), filepath);
			if(!filepath) {
				return next();
			}
			fs.readFile(filepath, 'utf8', function(err, contents) {
				var instrumented;
				if(!err) {
					try {
						instrumented = instrumenter.instrumentSync(contents, filepath);
						res.setHeader('Content-type', 'application/javascript');
						return res.send(instrumented);
					} catch(err) {
						console.warn("Unable to instrument file: " + filepath);
					}
				}
				return next();
			});
		}

		app.use(bodyParser.json({limit: '50mb'}));
		app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

		// Note: We don't currently allow for multiple sends. One and done, only.
		app.post('/coverage/client', function (req, res) {
            var baseDir = process.cwd(),
				collector = new istanbul.Collector();
			var body = req.body;
			if (!(body && typeof body === 'object')) { //probably needs to be more robust
				return res.status(400).send('Please post an object with content-type: application/json');
			}
			res.json({ok: true});
			utils.removeDerivedInfo(body);
			collector.add(body);
			Report.create('lcovonly', { dir: baseDir }).writeReport(collector, true);
			Report.create('html', { dir: path.join(baseDir, 'lcov-report') }).writeReport(collector, true);
		});
		app.get('*', instrumentRequest);
		app.use(express['static'](process.cwd()));
		app.listen(8789);
		console.log(process.cwd());

		grunt.task.run(['mocha_phantomjs:cover']);
	});
};
