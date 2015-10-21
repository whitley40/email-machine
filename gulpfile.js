// initiating gulp and plugins

var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
rename = require('gulp-rename'),
litmus = require('gulp-litmus'),
imageop = require('gulp-image-optimization'),
inlineCss = require('gulp-inline-css'),
browsersync = require('browser-sync').create(),
inlinesource = require('gulp-inline-source'),
del = require('del');

/* compiling the sass */

gulp.task('compileSass', function() {
    return gulp.src('src/scss/styles.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename('style.css'))
    .pipe(gulp.dest('src/css'));
});

// lets inline the email

gulp.task('inlineIt', function() {

    //grab the css and pop it into the hed of the html
    return gulp.src('src/**/*.html')
    .pipe(inlinesource())
    //now inline the css from the head, into the body 
    .pipe(inlineCss())
    .pipe(gulp.dest('dist'));
});

// image optimise and move

gulp.task('images', function(cb) {
    gulp.src(['src/**/*.png','src/**/*.jpg','src/**/*.gif','src/**/*.jpeg'])
    .pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest('dist')).on('end', cb).on('error', cb);
});


/* run browsersync */

gulp.task('browserSync', function() {
    browsersync.init( {
        server: {
            baseDir: "dist",
            directory:true
        }
    });

    gulp.watch(["src/**/*.html","src/scss/*.scss", 'src/**/*.png','src/**/*.jpg','src/**/*.gif','src/**/*.jpeg'], 
    ['compileSass','inlineIt','images']).on('change', browsersync.reload);

});


// adding in a litmus test

var config = {
    username: 'mark-whiitley@salecycle.com',
    password: 'lmUVAh7Qtex',
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
    return gulp.src('dist/email.html')
    .pipe(litmus(config))
    .pipe(gulp.dest('dist'));
});

/* setting up a clean */

gulp.task('clean', function(){
    del('dist' , 'src/css');
})

// building your email 

gulp.task("build", ['clean', "compileSass", "images", 'inlineIt','browserSync'], function() {
    .pipe(gulp.dest('dist'));
});

/* gulp default */

gulp.task("default", ["build"]);
gulp.task("test", ["litmus-test"]);

