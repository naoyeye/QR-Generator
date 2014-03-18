'use strict';

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var pathConfig = {
        app : 'app',
        dist : 'dist',
        tmp : '.tmp'
    };

    grunt.initConfig({
        paths : pathConfig,
        watch : {
        },
        open: {
            server : {
                path : 'http://127.0.0.1:8889/debug?port=5859',
                app : 'Google Chrome Canary'
            }
        },
        clean : {
            dist : ['<%= paths.tmp %>', '<%= paths.dist %>'],
            server : '<%= paths.tmp %>'
        },
        bump : {
            options : {
                files : ['package.json', '<%= paths.app %>/manifest.json', 'bower.json'],
                updateConfigs : [],
                commit : true,
                commitMessage : 'Release v%VERSION%',
                commitFiles : ['-a'],
                createTag : true,
                tagName : 'v%VERSION%',
                tagMessage : 'Version %VERSION%',
                push : false
            }
        },
        nodemon : {
            dev : {
                script : 'app.js',
                options : {
                    nodeArgs : ['--debug=5859'],
                    env : {
                        PORT : '1337'
                    }
                }
            }
        },
        concurrent : {
            server : {
                tasks : ['nodemon:dev', 'node-inspector', 'watch', 'open'],
                options : {
                    logConcurrentOutput: true
                }
            }
        },
        'node-inspector' : {
            custom : {
                options : {
                    'web-port' : 8889,
                    'web-host' : 'localhost',
                    'debug-port' : 5859,
                    'save-live-edit' : true,
                    'stack-trace-limit' : 4
                }
            }
        }
    });

    grunt.registerTask('server', [
        'concurrent:server'
    ]);

    grunt.registerTask(['update'], [
        'bump-only:patch',
        'changelog',
        'bump-commit'
    ]);

    grunt.registerTask(['build:release'], [
        'bump',
        'build'
    ]);

    grunt.registerTask(['build:patch'], [
        'bump:patch',
        'build'
    ]);

    grunt.registerTask('default', []);
};
