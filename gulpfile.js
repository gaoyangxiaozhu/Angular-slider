var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
// 静态服务器
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(["*.html", "*.css", "*.js"]).on('change', reload);
});

gulp.task('default', ['browser-sync']);
