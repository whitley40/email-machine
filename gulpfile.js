// initiating gulp and plugins

var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
rename = require('gulp-rename'),
litmus = require('gulp-litmus'),
imageop = require('gulp-image-optimization'),
inlineCss = require('gulp-inline-css'),
styleInject = require("gulp-style-inject"),
browsersync = require('browser-sync').create(),
debug = require('gulp-debug'),
del = require('del');

/* compiling the body style sass */

gulp.task('compileSass', function() {
    return gulp.src(['src/scss/body-style.scss','src/scss/head-style.scss'])
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename(['body-style.css','head-style.css']))
    .pipe(gulp.dest('src/css'));
});

// image optimise and move

gulp.task('imagesOpt', function(cb) {
    gulp.src(['src/imgs/*.png','src/imgs/*.jpg','src/imgs/*.gif','src/imgs/*.jpeg'])
    .pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest('dist')).on('end', cb).on('error', cb);
});


// lets inline the email

gulp.task('inlineEmail', ['compileSass', 'imagesOpt'], function() {
    //get the html and inline the source files
    return gulp.src('src/**/*.html')
    .pipe(inlineCss())
    .pipe(styleInject())
    .pipe(gulp.dest('dist'))
    .pipe(browsersync.stream());
});

/* run browsersync */

gulp.task('browserSync', function() {
    browsersync.init( {
        server: {
            baseDir: "dist",
            directory:true
        }
    });

    gulp.watch(["src/**/*.html","src/scss/*.scss","src/imgs/*.*"], ['inlineEmail']);

});

// adding in a litmus test

var config = {
    username: 'mark.whitley@salecycle.com',
    password: '',
    url: 'https://salecycle.litmus.com',
    applications: [
    'applemail6',
    'gmailnew',
    'ffgmailnew',
    'chromegmailnew',
    'iphone4s',
    ]
}

gulp.task('litmus-test', function () {
    return gulp.src('dist/service-email.html')
    .pipe(litmus(config))
    .pipe(gulp.dest('dist'));
});

/* setting up a clean */
gulp.task('clean', function(){
    del(['src/css', 'dist']);
})

// building your email 

gulp.task("build", ['clean', 'inlineEmail','browserSync']);

/* gulp default */

gulp.task("default", ["build"]);
gulp.task("test", ["litmus-test"]);

