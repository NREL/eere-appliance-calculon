module.exports = function(grunt) {


  var envToUse = grunt.option('env') || 'staging';
  var env = require('./_environments/' + envToUse + '.js');
  var s3 = require('./_config/s3.js')

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
    clean: {
      dist: ['dist']
    },

    'gh-pages': {
      options: {
        base: 'dist',
        message: 'Auto-generated commit'
      },
      src: ['**']
    },

    // http://www.netorials.com/tutorials/static-websites-amazon-s3-grunt-part-2/
    'aws_s3': {
        staging: {
            options: {
                accessKeyId: s3.accessKeyId,
                secretAccessKey: s3.secretAccessKey,
                bucket: env.s3.bucket,
                region: env.s3.region,
                sslEnabled: false
            },
            files: [
                {
                    expand: true,
                    dest: 'energysaver/calculator/',
                    cwd: 'dist',
                    src: ['**'],
                    action: 'upload',
                    differential: true
                }
                ,
                {
                    dest: 'energysaver/calculator/',
                    cwd: 'dist/',
                    action: 'delete',
                    differential: true
                }
            ]
        }
    },
  });

  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-aws-s3');



  grunt.registerTask('ghpages', [
      'clean:dist'
    , 'default'
    , 'gh-pages'
  ]);

  grunt.registerTask('aws:staging', [
      'clean:dist'
    , 'build'
    , 'aws_s3:staging'
  ]);

  grunt.registerTask('build', [
      'default'
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
