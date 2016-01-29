module.exports = function (grunt) {

    var sourceDir = grunt.option('source') || '/var/www/vhosts/';
    var backupDir = grunt.option('backup') || '/var/backup/';
    var today = grunt.template.today('yyyymmdd');

    grunt.initConfig({
        prompt: {
            target: {
                options: {
                    questions: [
                        {
                            config: 'domain.name',
                            type: 'input',
                            message: 'Domain name?',
                            validate: function (value) {
                                if (value == '') {
                                    return 'Should not be blank';
                                }
                                return true;
                            }
                        },
                        {
                            config: 'database.name',
                            type: 'input',
                            message: 'Database name?',
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
                            default: 'root'
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
                            default: 'localhost',
                            message: 'Database host?'
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
                        cwd: sourceDir + '<%= domain.name %>'
                    }
                ]
            }
        }
    });

    grunt.template.process('<%= backupDir %>/db-<%= date %>.sql', {
        backupDir: backupDir + grunt.config('domain.name'),
        date: grunt.template.today('yyyymmdd')
    });

    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-mysql-dump');
    grunt.loadNpmTasks('grunt-mkdir');

    grunt.registerTask('backup', ['prompt', 'mkdir', 'db_dump', 'compress']);

};