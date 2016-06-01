module.exports = function (grunt) {

    var domainName = grunt.option('domainName');
    var domainPath = grunt.option('domainPath');
    var databaseName = grunt.option('databaseName') || 'root';
    var databaseHost = grunt.option('databaseHost') || 'localhost';
    var databaseUsername = grunt.option('databaseUsername');
    var sourceDir = grunt.option('sourceDir') || '/var/www/vhosts/';
    sourceDir = sourceDir.replace(/\/?$/, '/');
    var backupDir = grunt.option('backupDir') || '/var/backup/';
    backupDir = backupDir.replace(/\/?$/, '/');

    var today = grunt.template.today('yyyymmdd');

    grunt.initConfig({
        prompt: {
            ask_domain: {
                options: {
                    questions: [
                        {
                            config: 'domain.name',
                            type: 'input',
                            message: 'Domain name?',
                            default: function() {
                                return domainName;
                            },
                            validate: function (value) {
                                if (value == '') {
                                    return 'Should not be blank';
                                }
                                return true;
                            }
                        }
                    ]
                }
            },
            ask_path: {
                options: {
                    questions: [
                        {
                            config: 'domain.path',
                            type: 'input',
                            default: function() {
                                if(domainPath) {
                                    return domainPath;
                                }

                                var domain = grunt.config('domain.name');
                                var subdomain = '';

                                var parts = domain.split('.');
                                while(parts.length > 2) {
                                    subdomain = parts.shift('.');
                                    if(parts.length > 2) {
                                        subdomain += '.';
                                    }
                                }

                                domain = parts.join('.');

                                if(subdomain) {
                                    return sourceDir + domain + '/' + 'subdomains/' + subdomain + '/httpdocs';
                                }

                                return sourceDir + domain + '/httpdocs';
                            },
                            message: 'Domain base path?'
                        }
                    ]
                }
            },
            ask_database: {
                options: {
                    questions: [
                        {
                            config: 'database.name',
                            type: 'input',
                            message: 'Database name?',
                            default: databaseName,
                            validate: function (value) {
                                if (value == '') {
                                    return 'Should not be blank';
                                }
                                return true;
                            }
                        },
                        {
                            config: 'database.username',
                            type: 'input',
                            message: 'Database username?',
                            default: databaseUsername
                        },
                        {
                            config: 'database.password',
                            type: 'password',
                            message: 'Database password?',
                            default: '',
                        },
                        {
                            config: 'database.hostname',
                            type: 'input',
                            message: 'Database host?',
                            default: databaseHost
                        }
                    ]
                }
            }
        },
        mkdir: {
            all: {
                options: {
                    mode: '0755',
                    create: [backupDir + '<%= domain.name %>']
                }
            }
        },
        db_dump: {
            "local": {
                "options": {
                    "title": "Local DB",

                    "database": '<%= database.name %>',
                    "user": '<%= database.username %>',
                    "pass": '<%= database.password %>',
                    "host": '<%= database.hostname %>',
                    "backup_to": backupDir + '<%= domain.name %>/db-' + today + '.sql'
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: backupDir + '<%= domain.name %>/files-' + today + '.tar.gz',
                    mode: 'tgz'
                },
                files: [
                    {
                        dot: true,
                        expand: true,
                        src: ['**/*'],
                        cwd: '../../../../' + '<%= domain.path %>'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-mysql-dump');
    grunt.loadNpmTasks('grunt-mkdir');

    grunt.registerTask('backup:database', ['prompt:ask_domain', 'prompt:ask_database', 'mkdir', 'db_dump']);
    grunt.registerTask('backup:files', ['prompt:ask_domain', 'prompt:ask_path', 'mkdir', 'compress']);
    grunt.registerTask('backup', ['backup:files', 'backup:database']);
    grunt.registerTask('default', ['backup']);

};
