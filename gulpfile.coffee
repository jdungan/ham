path       = require 'path'
gulp       = require 'gulp'
gutil      = require 'gulp-util'
stylus     = require 'gulp-stylus'
nib        = require 'nib'
CSSmin     = require 'gulp-minify-css'
browserify = require 'browserify'
watchify   = require 'watchify'
source     = require 'vinyl-source-stream'
streamify  = require 'gulp-streamify'
rename     = require 'gulp-rename'
uglify     = require 'gulp-uglify'
coffeeify  = require 'coffeeify'
ecstatic   = require 'ecstatic'
lr         = require 'tiny-lr'
livereload = require 'gulp-livereload'
plumber    = require 'gulp-plumber'
prefix     = require 'gulp-autoprefixer'
reloadServer = lr()

production = process.env.NODE_ENV is 'production'

paths =
  scripts:
    source: './src/coffee/main.coffee'
    destination: './public/js/'
    filename: 'bundle.js'
  styles:
    source: './src/stylus/style.styl'
    watch: './src/stylus/*.styl'
    destination: './public/css/'
  assets:
    source: './src/assets/**/*.*'
    watch: './src/assets/**/*.*'
    destination: './public/'

handleError = (err) ->
  gutil.log err
  gutil.beep()
  this.emit 'end'

gulp.task 'scripts', ->

  bundle = browserify
    entries: [paths.scripts.source]
    extensions: ['.coffee']

  build = bundle.bundle(debug: not production)
    .on 'error', handleError
    .pipe source paths.scripts.filename

  build.pipe(streamify(uglify())) if production

  build
    .pipe gulp.dest paths.scripts.destination

gulp.task 'styles', ->
  styles = gulp
    .src paths.styles.source
    .pipe(stylus({
      set: ['include css']
      # use: [nib()]
    }))
    .on 'error', handleError
    .pipe prefix 'last 2 versions', 'Chrome 34', 'Firefox 29', 'iOS 7'

  styles = styles.pipe(CSSmin()) if production

  styles.pipe gulp.dest paths.styles.destination
    .pipe livereload reloadServer

gulp.task 'assets', ->
  gulp
    .src paths.assets.source
    .pipe gulp.dest paths.assets.destination
    .pipe livereload reloadServer

gulp.task 'server', ->
  require('http')
    .createServer ecstatic root: __dirname + '/public'
    .listen 9001

gulp.task "watch", ->
  reloadServer.listen 35729

  gulp.watch paths.styles.watch, ['styles']
  gulp.watch paths.assets.watch, ['assets']

  bundle = watchify
    entries: [paths.scripts.source]
    extensions: ['.coffee']

  bundle.on 'update', ->
    build = bundle.bundle(debug: not production)
      .on 'error', handleError

      .pipe source paths.scripts.filename

    build
      .pipe gulp.dest paths.scripts.destination
      .pipe(livereload(reloadServer))

  .emit 'update'

gulp.task "build", ['scripts', 'styles', 'assets']
gulp.task "default", ["build", "watch", "server"]
