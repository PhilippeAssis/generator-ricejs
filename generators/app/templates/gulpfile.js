var gulp = require('gulp');
var stylus = require('gulp-stylus');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var pug = require('gulp-pug');
var autowatch = require('gulp-autowatch');
var plumber = require('gulp-plumber');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var serve = require("gulp-serve")
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var fs = require('fs');
var path = require('path');

var walkSync = (dir, fileList = []) => {
    fs.readdirSync(dir).map(file => {
        const filePath = path.join(dir, file)

        if (fs.statSync(filePath).isDirectory()) {
            walkSync(filePath).map(fil => {
                fileList.push(fil)
            })
        }
        else {
            fileList.push(filePath)
        }
    })

    return fileList
}

gulp.task('stylus', function() {
    gulp.src('./<%= apppath  %>/styles/*.styl')
        .pipe(plumber())
        .pipe(stylus({
            'include css': true
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./<%= publicpath  %>/css'))
        .pipe(livereload());
});

gulp.task('less', function() {
    gulp.src('./<%= apppath  %>/styles/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./<%= publicpath  %>/css'))
        .pipe(livereload());
});

gulp.task('views', function() {
    gulp.src('./<%= publicpath  %>/*.html')
        .pipe(clean())

    gulp.src('./<%= apppath  %>/views/templates/*.pug')
        .pipe(plumber())
        .pipe(pug())
        .pipe(gulp.dest('./<%= publicpath  %>'))
        .pipe(livereload());
})

gulp.task('assets', function() {
    // gulp.src(['./<%= apppath  %>/assets/*','./<%= apppath  %>/assets/**/*','./<%= apppath  %>/assets/**/**/*'])
    //     .pipe(des)
})


gulp.task('scripts', function() {
    var riceFiles = walkSync("./<%= apppath  %>").map(file => {
        return "./" + file
    }).filter(file => {
        return ([".js", ".json"].indexOf(path.extname(file)) > -1 && file != "./<%= apppath  %>/app.js")
    })

    browserify('./<%= apppath  %>/app.js')
        .transform(babelify.configure({
            presets: ["es2015"],
            sourceMapsAbsolute: true
        }))
        .require(riceFiles)
        .bundle()
        .pipe(plumber())
        .pipe(source('app.js'))
        .pipe(gulp.dest('./<%= publicpath  %>/js'))
        .pipe(livereload());
})

gulp.task('watch', function() {
    autowatch(gulp, {
        'views': './<%= apppath  %>/views/**/*.pug',
        'scripts': ['./<%= apppath  %>/**/*.js', './<%= apppath  %>/**/**/*.js', './<%= apppath  %>/**/**/**/*.js'],
        'stylus': ['./<%= apppath  %>/styles/*.styl', './<%= apppath  %>/styles/**/*.styl'],
        'less': ['./<%= apppath  %>/styles/*.less', './<%= apppath  %>/styles/**/*.less']
    });
});

gulp.task('serve', serve({
    root: './<%= publicpath  %>',
    port: gulp.env.port || 8080
}))

gulp.task('default', ['scripts', 'views', 'stylus', 'less']);

gulp.task('live', ['scripts', 'views', 'stylus', 'less', 'watch', 'serve']);
