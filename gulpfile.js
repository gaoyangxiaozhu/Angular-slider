var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
var minifycss   = require('gulp-minify-css');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var del         = require('del');
// 静态服务器
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./src/"
        }
    });
    gulp.watch(["*.html", "*.css", "*.js"]).on('change', reload);
});
//压缩css
gulp.task('minifycss', function() {
    return gulp.src('src/*.css')      //压缩的文件
        .pipe(gulp.dest('dist'))   //输出文件夹
        .pipe(minifycss());   //执行压缩
});
//压缩js
gulp.task('minifyjs', function() {
    return gulp.src('src/slider.js')
        .pipe(gulp.dest('dist'))    //输出main.js到文件夹
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('dist'));  //输出
});
//clean
gulp.task('clean', function() {
    del('dist/*');
});

gulp.task('default', ['clean'], function(){
 gulp.start('minifycss', 'minifyjs');
});

gulp.task('dev', ['browser-sync']);
