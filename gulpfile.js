/**
 * Created by bizic on 26/8/2016.
 */
var gulp = require('gulp');
var minifyJS = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var deleteEmpty = require('delete-empty');
var gulpIf = require('gulp-if');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var rename = require('gulp-rename');
var minify = require('gulp-minify');
var filter = require('gulp-filter');
var clean = require('gulp-clean');

/* Clean up the build folder */
gulp.task('clean:build', function () {
    return del.sync(['build']);
});

/* Compiling sass to css */
gulp.task('sass', function () {
    return gulp.src('src/app/assets/scss/*.+(scss|sass)')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('src/app/assets/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

/* Automatically sync resources change with browser */
gulp.task('browserSync', function () {
    browserSync.init({
        port: 3002,
        server: {
            baseDir: 'src/app'
        }
    })
});

/* Watch file changes and sync */
gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch('src/app/assets/scss/**/*.+(scss|sass)', ['sass']);
    gulp.watch(['src/**/*.html', '!src/app/assets/plugins/**/*.html'], browserSync.reload);
    gulp.watch(['src/**/*.css', '!src/app/assets/plugins/**/*.css'], browserSync.reload);
    gulp.watch(['src/**/*.js', '!src/app/assets/plugins/**/*.js'], browserSync.reload);
});

/* Minify js files */
gulp.task('minifyJs', function () {
    return gulp.src(['build/**/*.js', '!build/**/*.min.js', '!build/app/assets/plugins/**/*'])
        .pipe(minifyJS({preserveComments: 'license'}))
        .pipe(gulp.dest('build'));
});

/* Minify HTML files */
gulp.task('minifyHTML', function () {
    return gulp.src(['build/**/*.html', '!build/app/index.html', '!build/app/assets/**/*.html'])
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest('build'));
});

/* Compress/concatinate html and included js/css files */
gulp.task('useref', function () {
    return gulp.src(['src/app/index.html'])
        .pipe(useref())
        .pipe(gulpIf(['*.js', '!*.min.js'], minify({mangle: false, ignoreFiles: ['*.min.js'], noSource: true})))
        .pipe(gulpIf(['*.css', '!*.min.css'], minifyCSS()))
        .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true, removeComments: true})))
        .pipe(gulp.dest('build/app'))
});

/* Copy all other files */
gulp.task('copyFiles', function () {
    return gulp.src([
        'src/**/*',
        '!src/app/assets/scripts/**/*',
        '!src/app/assets/scss/**/*',
        '!src/app/*.js',
        '!src/app/common/*.js',
        '!src/app/admin/*.js',
        '!src/app/member/*.js'
    ])
        .pipe(gulp.dest('build'));
});

/* Move useref's built files to inside build/app folder */
gulp.task('moveFiles', function () {
    return gulp.src(['build/assets/**/*'])
    // .pipe(vinylPaths(del))
        .pipe(gulp.dest('build/app/assets'));
});

/* Remove empty folders */
gulp.task('removeEmptyFolders', function () {
    deleteEmpty.sync('build/app');
});

/* Clear cache -- */
gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback)
});

/* Default task to compile css and sync browser */
gulp.task('default', function (callback) {
    runSequence(['sass', 'browserSync', 'watch'],
        callback
    )
});

gulp.task('compile-step1', function () {
    return gulp.src([
        'src/app/assets/**/*',
        // '!src/app/assets/scripts/**/*',
        '!src/app/assets/scss/**/*',
        // '!src/app/assets/css/**/*.css',
    ])
        .pipe(gulp.dest('build/app/assets'));
});

gulp.task('compile-step2', ['compile-step1'], function () {
    return gulp.src(['src/app/*.js', 'src/app/*/*.module.js', 'src/app/*/utils/*.js', 'src/app/index.html'])
        .pipe(gulp.dest('build/app'));
});

gulp.task('compile-step3', ['compile-step2'], function () {
    var filter1 = filter(['src/app/*/views/*.html', '!src/app/common/views/application.html', '!src/app/common/views/navs/*.html', 'src/app/*/business/*.js', '!src/app/*/business/UserService.js', '!src/app/*/business/NotificationService.js', 'src/app/*/controllers/*.js'], {restore: true});
    var filterHtml = filter(['src/app/*/views/*.html', 'src/app/**/pages/*.html', 'src/app/**/fragments/*.html', 'src/app/**/login/*.html', 'src/app/**/navs/*.html'], {restore: true});

    return gulp.src(['src/app/*/views/*.html', 'src/app/**/login/*.html', 'src/app/**/navs/*.html', 'src/app/**/pages/*.html', 'src/app/**/fragments/*.html', 'src/app/*/business/*.js', 'src/app/*/controllers/*.js', 'src/app/*/*.module.js', '!src/app/assets/*.*'])
        .pipe(minify({ext: {min: '.js'}, mangle: false, ignoreFiles: ['*.min.js'], noSource: true}))
        .pipe(filterHtml)
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(filterHtml.restore)
        .pipe(filter1)
        .pipe(rev())
        .pipe(filter1.restore)
        .pipe(revReplace())
        .pipe(gulp.dest('build/app'));
});

gulp.task('compile-step4', ['compile-step3'], function () {
    var jsFilter = filter(['**/*.js', '!**/*.min.js'], {restore: true});
    var indexHtmlFilter = filter(['**/*', '!**/index.html'], {restore: true});

    return gulp.src(['build/app/index.html'])
        .pipe(useref())
        .pipe(jsFilter)
        .pipe(minify({mangle: false, ignoreFiles: ['*.min.js'], noSource: true}))
        .pipe(jsFilter.restore)
        .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true, removeComments: true})))
        .pipe(indexHtmlFilter)
        .pipe(rev())
        .pipe(indexHtmlFilter.restore)
        .pipe(revReplace())
        .pipe(gulp.dest('build/app'));
});

gulp.task('compile-step5', ['compile-step4'], function () {
    return gulp.src(['build/app/assets/scripts/compiled-*.js'])
        .pipe(minify({ext: {min: '.js'}, mangle: false, noSource: true}))
        // .pipe(clean())
        .pipe(gulp.dest('build/app/assets/scripts'));
});

gulp.task('compile-step6', ['compile-step5'], function () {
    return gulp.src(['build/app/assets/css/external/*.*', '!build/app/assets/css/external/*.css'])
        .pipe(gulp.dest('build/app/assets/css/dist'));
});

gulp.task('compile-step7', ['compile-step6'], function () {
    return del.sync([
        'build/app/*.js',
        'build/app/common/utils',
        'build/app/users/business/UserService.js',
        'build/app/common/business/NotificationService.js',
        'build/app/assets/scripts/external/*',
        'build/app/assets/scripts/external/*.*',
        '!build/app/assets/scripts/external/support_lt_ie9.js',
        'build/app/assets/scss',
        'build/app/assets/scripts/*.js',
        '!build/app/assets/scripts/compiled-*.js',
        'build/app/assets/css/external/*.*',
        '!build/app/assets/css/external/flatpickr-ie.css',
        'build/app/assets/css/*.css',
        '!build/app/assets/css/login.min.css',
        '!build/app/assets/css/compiled-*.css',
        'build/app/*/*.module.js'
    ]);
});

gulp.task('compile-all', function (callback) {
    runSequence('clean:build', 'compile-step7');
});

/* Build the project */
gulp.task('build', function (callback) {
    runSequence('clean:build', 'sass',
        'copyFiles', 'useref', 'moveFiles', 'minifyJs', 'minifyHTML', 'removeEmptyFolders',
        callback
    )
});