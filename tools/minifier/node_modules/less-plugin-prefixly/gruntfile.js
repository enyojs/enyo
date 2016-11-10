module.exports = function(grunt) {

  grunt.initConfig({
	  browserify: {
		  dist: {
			files: {
			  'lib/prefixly.js': ['src/**/*.js'],
			}
		  }
		}
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('default', ['browserify:dist']);
};