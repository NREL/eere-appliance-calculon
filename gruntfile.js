module.exports = function(grunt) {


  var envToUse = grunt.option('env') || 'staging';
  var env = require('./_environments/' + envToUse + '.js');
  var s3 = require('./_config/s3.js')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    babel: {
        options: {
            sourceMap: true,
            presets: ['es2015']
        },
        dist: {
            files: {
                'dist/client/js/app.js': 'dist/client/js/app.js'
            }
        }
    },

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
        banner: '/*!\n'+
                ' * Project: <%= pkg.name %>\n'+
                ' * Version: <%= pkg.version %>\n'+
                ' * Author: <%= pkg.author %>\n'+
                ' * Build Date: <%= grunt.template.today("dd-mm-yyyy") %>\n'+
                ' */\n',
        sourceMap: true,
        sourceMapName: 'dist/client/js/app.js.map',
        compress: {
            drop_console: true
        }
      },
      dist: {
        files: {
          'dist/client/js/app.min.js': ['dist/client/js/app.js']
        }
      }
    },

    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n\n'
      , keepSpecialComments: '*'
      },
      dist: {
        files: {
          'dist/client/css/styles.min.css': ['dist/client/css/styles.css']
        }
      }
    },

    eslint: {
        target: ['src/client/js/app.js']
    },

    clean: {
      dist: ['dist']
      //dist: ['dist', '!dist/.gitkeep']
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
        release: {
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

    watch: {

        //js: {
            files: ['src/*'],
            tasks: ['build'],
            options: {
                livereload: true,
            }
        //}
    }
  });

  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-gh-pages');



  grunt.registerTask('ghpages', [
      'clean:dist'
    , 'build'
    , 'gh-pages'
  ]);

  grunt.registerTask('deploy', [
      'clean:dist'
    , 'build'
    , 'aws_s3'
  ]);

  grunt.registerTask('build', [
      'copy'
    , 'eslint'
    , 'babel'
    , 'uglify'
    , 'cssmin'
  ]);

  grunt.registerTask('default', [
      'build'
  ]);


};
