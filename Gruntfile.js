module.exports = function (grunt) {

	grunt.initConfig({

		jshint: {
			options: {
				jshintrc: true
			},

			// initially we're only looking at the source directory but will need to add all of
			// the unit tests as well
			all: ['source/**/*.js']
		},

		mocha_phantomjs: {
			all: ['tools/mocha-tests/index.html'],
			cover: { options: {urls: ['http://localhost:8789/tools/mocha-tests/index.html'] } }
		},

		exec: {

			// need to still execute the older tests
			core: './node_modules/.bin/phantomjs tools/test/core/phantomjs-test.js'
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');

	// currently this is only being used because we are still running the older unit-tests
	grunt.loadNpmTasks('grunt-exec');

	grunt.registerTask('test', ['jshint', 'mocha_phantomjs:all', 'exec:core']);

	grunt.loadTasks('tasks');
};
