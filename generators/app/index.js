'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    this.option("controller")
    this.option("service")
  }

  init() {
    this.log(yosay(
      chalk.green('Welcome to rice!')
    ));

    this.argument('args', {
      type: Array,
      required: false
    });

    if (this.options && this.options.args) {
      return;
    }

    if (this.options.controller) {
      var prompts = [{
        type: 'input',
        name: 'controllername',
        message: 'Your controller name',
        default: this.appname
      }]
    }
    else if (this.options.service) {
      var prompts = [{
        type: 'input',
        name: 'servicename',
        message: 'Your services name',
        default: this.appname
      }]
    }
    else {
      var prompts = [{
        type: 'input',
        name: 'appname',
        message: 'Your project name',
        default: this.appname
      }, {
        type: 'input',
        name: 'apppath',
        message: 'Project directory name',
        default: 'app'
      }, {
        type: 'input',
        name: 'publicpath',
        message: 'Public directory name',
        default: 'public'
      }, {
        type: 'list',
        name: 'theme',
        message: 'Do you want to use bootswatch?',
        default: 'Do not use.',
        choices: ["Do not use.", "cerulean", "cosmo", "cyborg", "darkly", "flatly", "journal", "lumen", "paper", "readable", "sandstone", "simplex", "slate", "spacelab", "superhero", "united", "yeti", "fonts"].sort()
      }, {
        type: 'checkbox',
        name: 'libs',
        message: 'Additional libraries:',
        choices: ["vue", "jquery"]
      }];
    }

    return this.prompt(prompts).then(function(props) {
      if (props.theme == "Do not use.") {
        props.theme = false
      }

      this.props = props;
    }.bind(this));
  }

  controllerCreate() {
    if (this.options.controller) {
      return this.fs.copyTpl(
        this.templatePath('controller.js'),
        this.destinationPath(`controllers/${this.props.controllername}Controller.js`), {
          "name": this.props.controllername
        }
      );
    }
  }

  serviceCreate() {
    if (this.options.service) {
      return this.fs.copyTpl(
        this.templatePath('service.js'),
        this.destinationPath(`services/${this.props.servicename}Service.js`), {
          "name": this.props.servicename
        }
      );
    }
  }

  writing() {
    if (this.options.service || this.options.controller) {
      return;
    }

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'), {
        "appname": this.props.appname
      }
    );

    this.fs.copy(
      this.templatePath('default'),
      this.destinationPath(`./${this.props.apppath}`)
    );

    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'), {
        "apppath": this.props.apppath,
        "publicpath": this.props.publicpath
      }
    );

    this.fs.copyTpl(
      this.templatePath('gitignore.txt'),
      this.destinationPath('.gitignore'), {
        "publicpath": this.props.publicpath
      }
    );

    if (this.props.theme) {
      this.fs.copyTpl(
        this.templatePath('bootstrap/styles/app.styl'),
        this.destinationPath(`./${this.props.apppath}/styles/app.styl`), {
          "theme": this.props.theme
        }
      );

      this.fs.copyTpl(
        this.templatePath('bootstrap/views/templates/index.pug'),
        this.destinationPath(`./${this.props.apppath}/views/templates/index.pug`), {
          "name": this.props.appname.replace(/-/g, " ")
        }
      );
    }
  }

  install() {
    if (this.options.controller || this.options.service) {
      return;
    }

    /**
     * npm install --save
     */
    this.props.libs.push("ricejs");
    var modules = this.props.libs;

    this.npmInstall(modules, {
      'save': true
    });

    /**
     * npm install --save-dev
     */
    var modulesDev = ['gulp', 'gulp-autowatch',
      'gulp-clean', 'gulp-clean-css',
      'gulp-less', 'gulp-stylus', 'gulp-livereload', 'gulp-plumber', 'gulp-pug', 'gulp-sourcemaps',
      'gulp-babel', 'babel-preset-es2015', 'babel-cli', 'gulp-action-comment', 'gulp-serve',
      'browserify', 'babelify', 'vinyl-source-stream'
    ]

    if (this.props.theme) {
      modulesDev.push("bootswatch")
    }

    this.npmInstall(modulesDev, {
      'save-dev': true
    });

    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    });

    this.log("All set, good luck.")
  }
}
