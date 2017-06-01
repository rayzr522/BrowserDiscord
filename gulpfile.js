const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const paths = {
    entryPoint: 'src/index.js',
    srcFiles: 'src/**/*.js'
};

gulp.task('webpack', () =>
    gulp.src(paths.entryPoint)
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(gulp.dest('dist/'))
);

gulp.task('main', ['webpack']);

gulp.task('watch', () => {
    gulp.watch([paths.srcFiles], ['main']);
});

gulp.task('default', ['main', 'watch']);