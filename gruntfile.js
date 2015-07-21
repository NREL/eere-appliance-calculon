module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    useminPrepare: {
      html: 'index.html',
      options: {
        dest: 'dist'
      }
    },

    usemin: {
      html: 'dist/index.html'
      //, options: {
      //   assetsDirs: ['dist', 'dist/css', 'dist/js', 'css', 'js']
      // }
    },

    copy: {
      dist: {
        cwd: 'src',
        src: [ '**' ],
        dest: 'dist',
        expand: true
      },
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/client/js/app.min.js': ['dist/client/js/app.js']
        }
      }
    },

    jshint: {
      files: ['dist/client/js/app.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          document: true
        },
        laxcomma: true,
        asi: true
      }
    },

    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      , keepSpecialComments: '*'
      },
      dist: {
        files: {
          'dist/client/css/styles.min.css': ['dist/client/css/styles.css']
        }
      }
    },

    'gh-pages': {
      options: {
        base: 'dist',
        message: 'Auto-generated commit'
      },
      src: ['**']
    }
  });


  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('build', [
      'default'
  ]);

  grunt.registerTask('ghpages', [
      'default'
    , 'gh-pages'
  ]);

  grunt.registerTask('default', [
      'copy'
    , 'useminPrepare'
    , 'jshint'
    , 'uglify'
    , 'cssmin'
    , 'usemin'
  ]);


};
