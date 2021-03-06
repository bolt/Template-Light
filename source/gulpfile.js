//=== Plugins

const   gulp            = require('gulp'),
        browserSync     = require('browser-sync').create(),
        sass            = require('gulp-sass'),
        webpack         = require('webpack-stream'),
        environments    = require('gulp-environments'),
        postcss         = require('gulp-postcss'),
        autoprefixer    = require('autoprefixer'),
        cssnano         = require('cssnano'),
        sourcemaps      = require('gulp-sourcemaps'),
        uglify          = require('gulp-uglify');

//=== Environments

const   development     = environments.development,
        production      = environments.production,
        currentEnv      = environments.current().$name


//=== Compile Javascript

gulp.task('js', function() {

    // Watch Switch
    let watchBuild;

    if(currentEnv == 'development'){
        watchBuild = true;
    }else{
        watchBuild = false;
    }

    // Javascript Webpack Function
    return gulp.src('js/main.js')
        .pipe(webpack({
            // watch: watchBuild,
            config: require('./webpack.config.js')
        }))
        .pipe(production(uglify()))
        .pipe(gulp.dest('../public/js'));

  });

 //=== Compile SASS

gulp.task('sass', function() {

    // PostCSS Plugins
    const   processors = [
                autoprefixer({browsers: ['last 1 version']})
            ];

    // SASS Compiler Routine
    return gulp.src(['scss/main.scss'])

        // Init Source Map In Development
        .pipe(development(sourcemaps.init()))

        // Compile SASS
        .pipe(sass().on('error', sass.logError))

        // Write Source Map In Development
        .pipe(development(sourcemaps.write()))

        // Run PostCSS
        .pipe(postcss(processors))

        // Minify CSS in Production
        .pipe(production(postcss([cssnano()])))

        // Pipe to Build Folder
        .pipe(gulp.dest('../public/css'))

        // Stream to BrowserSync in Development
        .pipe(development(browserSync.stream()))

});

//=== Move Assets

gulp.task('assets', function() {
    return gulp.src('assets/**')
        .pipe(gulp.dest('../public/assets'))
})

//=== Setup Server

gulp.task('server', gulp.series('sass', function() {

    // Run LiveReload Server in Development
    if(currentEnv == 'development'){
        // browserSync.init({
        //     server: "./build"
        // });

        // Watch Directories for changes
        // gulp.watch(['assets/**'], ['assets']);
        gulp.watch(['scss/**'], ['sass']);
        // gulp.watch("build/*.html").on('change', browserSync.reload);
    }

}));

//=== Gulp Default Task

if(currentEnv == 'development'){
    gulp.watch(['scss/**'], gulp.series('sass'));
}

gulp.task('default', gulp.series('sass', 'js', 'assets'));

