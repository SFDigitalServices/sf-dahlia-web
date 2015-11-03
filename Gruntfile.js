'use strict';
module.exports = function(grunt) {

  grunt.initConfig({

  // Define our Pattern Library and Application Assets paths
  applicationAssetsPath: 'app/assets',
  patternLibraryPath: '../sf-dahlia-pattern-library',

  // Delete the old toolkit.css
  clean: {
    css: ['<%= applicationAssetsPath %>/stylesheets/toolkit.css']
  },

  //Copy the latest compiled toolkit.css file from the pattern library into our app
  copy: {
    main: {
      files: [
        {
          src: '<%= patternLibraryPath %>/dist/assets/toolkit/styles/toolkit.css',
          dest: '<%= applicationAssetsPath %>/stylesheets/toolkit.css'
        }
      ],
    },
  },

  //Make any string replacements that are needed when transfering assets to app.
  replace: {
    dist: {
      options: {
        patterns: [
          {
            match: 'http://fonts.googleapis.com',
            replacement: '//fonts.googleapis.com'
          }
        ],
        usePrefix: false
      },
      files: [
        {
          expand: true, flatten: true,
          src: ['<%= applicationAssetsPath %>/stylesheets/toolkit.css'],
          dest: '<%= applicationAssetsPath %>/stylesheets/'
        }
      ]
    }
  },

});

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');

  // register task
  grunt.registerTask('default', [
    'clean',
    'copy',
    'replace'
  ]);

  grunt.registerTask('deploy', [
    'clean',
    'copy',
    'replace'
  ]);

};
