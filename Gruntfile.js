module.exports = function (grunt) {
	
	grunt.initConfig({
		
		jshint: {
			options: {
				jshintrc: true
			},
			
			// initially we're only looking at the source directory but will need to add all of
			// the unit tests as well
			all: ['source/**/*.js']
		}
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.registerTask('test', ['jshint']);
	
};