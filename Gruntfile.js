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
          src: '<%= patternLibraryPath %>/dist/toolkit/styles/toolkit.css',
          dest: '<%= applicationAssetsPath %>/stylesheets/toolkit.scss'
        }
      ],
    },
    removeLanguageKey: {
      files: [
        {
          src: 'app/assets/json/translations/locale-en.json',
          dest: 'app/assets/json/translations/locale-en.json'
        },
        {
          src: 'app/assets/json/translations/locale-es.json',
          dest: 'app/assets/json/translations/locale-es.json'
        },
        {
          src: 'app/assets/json/translations/locale-tl.json',
          dest: 'app/assets/json/translations/locale-tl.json'
        },
        {
          src: 'app/assets/json/translations/locale-zh.json',
          dest: 'app/assets/json/translations/locale-zh.json'
        }
      ],
      options: {
        // the locale files are prefixed with a key indicating the language but we remove this prefixed key
        // via the process function below so that it can run through i18nextract translation process
        // e.g. {"es": {key: value}} just returns { key: value }
        process: function (content, srcpath) {
          let locale = srcpath.split('-')[1].split('.')[0]
          return JSON.stringify(JSON.parse(content)[locale], null, 4);
        }
      }
    },
    addBackLanguageKey: {
      files: [
        {
          src: 'app/assets/json/translations/locale-en.json',
          dest: 'app/assets/json/translations/locale-en.json'
        },
        {
          src: 'app/assets/json/translations/locale-es.json',
          dest: 'app/assets/json/translations/locale-es.json'
        },
        {
          src: 'app/assets/json/translations/locale-tl.json',
          dest: 'app/assets/json/translations/locale-tl.json'
        },
        {
          src: 'app/assets/json/translations/locale-zh.json',
          dest: 'app/assets/json/translations/locale-zh.json'
        }
      ],
      options: {
        // Add back the prefixed key indicating the language
        // e.g. { key: value } returns {"es": { key: value }}
        process: function (content, srcpath) {
          let locale = srcpath.split('-')[1].split('.')[0]
          let body =  {}
          body[locale] = JSON.parse(content)
          return JSON.stringify(body, null, 4);
        }
      }
    }
  },

  //Make any string replacements that are needed when transfering assets to app.
  replace: {
    dist: {
      options: {
        patterns: [
          {
            match: 'http://fonts.googleapis.com',
            replacement: '//fonts.googleapis.com'
          },
          {
            match: /\.\.\/images\/([a-zA-Z0-9\-_@]*\.(png|jpg|svg))/g,
            replacement: "asset-path('$1')"
          }
        ],
        usePrefix: false
      },
      files: [
        {
          expand: true, flatten: true,
          src: ['<%= applicationAssetsPath %>/stylesheets/toolkit.scss'],
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
        'app/assets/javascripts/**/*.html.slim',
        'app/views/layouts/application.html.slim',
        'app/views/devise/mailer/*.html.slim',
        'app/views/emailer/*.html.slim',
        'app/views/layouts/email.html.slim',
        'app/mailers/**/*.rb',
      ],
      customRegex: [
         '\{\{\\s*(?:::)?\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate(:.*?)?\\s*(?:\\s*\\|\\s*[a-zA-Z]*)?\}\}',
         '="\'((?:\\\\.|[^\'\\\\])*)\'\\s*\\|\\s*translate"',
         'translate="([A-Z0-9\.\-\_]*)"',
         'translated-error="([A-Z\.\-\_]*)"',
         'translated-description="([A-Z\.\-\_]*)"',
         'translated-short-description="([A-Z\.\-\_]*)"',
         'translatedLabel: \'([A-Z\.\-\_]*)\'',
         // email template regexes below
         ' t \'([A-Z\.\-\_]*)\'',
         ' t\\(\'([A-Z\.\-\_]*)\'',
         '\\(t\\(\'([A-Z\.\-\_]*)\'',
         '#{t\\(\'([A-Z\.\-\_]*)\'',
         'I18n\.translate\\(\n?[ ]*\'([A-Z\.\-\_]*)\'', // emailer.rb usages
         'flagForI18n.\'([A-Z0-9\.\-\_]*)\'' // search for flagForI18n([translation string]
       ],
      namespace: true,
      lang:     ['locale-en', 'locale-es', 'locale-tl', 'locale-zh'],
      dest:     'app/assets/json/translations'
    }
  },
  json_remove_fields: {
    locale_es: {
        src: 'app/assets/json/translations/locale-es.json'
    },
    locale_tl: {
        src: 'app/assets/json/translations/locale-tl.json'
    },
    locale_zh: {
        src: 'app/assets/json/translations/locale-zh.json'
    }
  },
  sortJSON: {
    src: [
      'app/assets/json/translations/locale-en.json',
      'app/assets/json/translations/locale-es.json',
      'app/assets/json/translations/locale-tl.json',
      'app/assets/json/translations/locale-zh.json'
    ],
    // options: {
    //   spacing: 2
    // }
  },
  exec: {
    phrasePull: {
      cmd: function() {
        var token = grunt.option('phraseAccessToken')
        return 'phrase pull --access_token ' + token;
      }
    },
    phrasePush: {
      cmd: function() {
        var token = grunt.option('phraseAccessToken')
        return 'phrase push --access_token ' + token;
      }
    }
  }
});

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace-regex');
  grunt.loadNpmTasks('grunt-angular-translate');
  grunt.loadNpmTasks('grunt-sort-json');
  grunt.loadNpmTasks('grunt-json-remove-fields');
  grunt.loadNpmTasks('grunt-exec');

  // Set this variable by appending --phraseAccessToken=[token] to any grunt command.
  var phraseAccessToken = grunt.option('phraseAccessToken');
  // register task
  grunt.registerTask('default', [
    'clean',
    'copy',
    'replace'
  ]);

  grunt.registerTask('translations', [
    'copy:removeLanguageKey',
    'i18nextract',
    'copy:addBackLanguageKey',
    'json_remove_fields',
    'sortJSON',
  ]);
  grunt.registerTask('phrasePush', [
    'copy:removeLanguageKey',
    'exec:phrasePush',
    'copy:addBackLanguageKey',
    'json_remove_fields',
    'sortJSON',
  ]);

  grunt.registerTask('phrasePull', [
    'copy:removeLanguageKey',
    'exec:phrasePull',
    'copy:addBackLanguageKey',
    'json_remove_fields',
    'sortJSON',
  ]);

  grunt.registerTask('deploy', [
    'clean',
    'copy',
    'replace'
  ]);

};
