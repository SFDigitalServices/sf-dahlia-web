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

  i18nextract: {
    default_options: {
      src: [
        'app/assets/javascripts/**/*.js',
        'app/assets/javascripts/**/*.js.coffee',
        'app/assets/javascripts/**/*.html',
        'app/assets/javascripts/**/*.html.slim'
      ],
      customRegex: [ '\{\{\\s*(?:::)?\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate(:.*?)?\\s*(?:\\s*\\|\\s*[a-zA-Z]*)?\}\}' ],
      namespace: true,
      lang:     ['locale-en'],
      dest:     'public/translations'
    }
  },

});

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-angular-translate');


  // register task
  grunt.registerTask('default', [
    'clean',
    'copy',
    'replace'
  ]);

  grunt.registerTask('translations', [
    'i18nextract'
  ]);

  grunt.registerTask('deploy', [
    'clean',
    'copy',
    'replace'
  ]);

};
