// 获取gulp
var gulp = require('gulp'),
    path = require('path'),
    merge = require('merge-stream'),
    rename = require('gulp-rename'),
    csso = require('gulp-csso'),
    watch = require("gulp-watch"),
    sass = require('gulp-sass'),//获取gulp-sass模块
    livereload = require('gulp-livereload');//获取gulp-livereload模块（实现浏览器自动刷新）
    
var folders = ['./pages'];

// 给gulp设置任务，编译sass
// 在命令行输入 gulp sass 启动此任务
gulp.task('sass',function(done){

	// 被编译文件的路径
	// var tasks = folders.map(function(element){
    //     return gulp.src(element + '/**/*.scss')
    //         // ... other steps ...
    //         .pipe(sass())
    //         .pipe(rename({
    //             extname: ".acss"})) // 重命名后缀
    //         .pipe(csso()) // 压缩
    //         .pipe(gulp.dest(element))// 输出
    //         .pipe(livereload());
    // });

    // return merge(tasks);
	return gulp.src(['./**/**/*.scss','!./node_modules/**/*.scss'])
  // return gulp.src('./src/sass/**/*.scss')
  
  	 // ** 匹配路径中的0个或多个目录及其子目录,需要单独出现，即它左右不能有其他东西了
     	//使用数组的方式来匹配多种文件 gulp.src(['js/*.js','css/*.css','*.html'])
       	// * 匹配文件路径中的0个或多个字符
         	
           	 // **/*.js 能匹配 foo.js,a/foo.js,a/b/foo.js,a/b/c/foo.js
              	// 通过pipe管道，使用 sass (此处的sass是上面使用 var声明的 sass )来读取/src

// 通过pipe管道，使用 sass (此处的sass是上面使用 var声明的 sass )来读取/src

   // ** 匹配路径中的0个或多个目录及其子目录,需要单独出现，即它左右不能有其他东西了
   	//使用数组的方式来匹配多种文件即它左右不能有其他东西了
	//使用数组的方式来匹配多种文件 gulp.src(['js/*.js','css/*.css','*.html'])
	// * 匹配文件路径中的0个或多个字符
	
	 // **/*.js 能匹配 foo.js,a/foo.js,a/b/foo.js,a/b/c/foo.js
	// 通过pipe管道，使用 sass (此处的sass是上面使用 var声明的 sass )来读取/src/**/*.scss文件
    
	.pipe(sass())
    .pipe(rename({
        extname: ".acss"}))// 重命名后缀
    .pipe(csso()) // 压缩
	//编译后文件输出的目录
    .pipe(gulp.dest('./'))// 输出
    
	 // 使用livereload 方法实现浏览器自动刷新
    .pipe(livereload());

});

// 使用 gulp watch命令来监听scss文件变化，
gulp.task('watch', function() {
   livereload.listen(); //要在这里调用listen()方法
    // 遍历所有需要打包的SCSS/CSS文件路径
    watch(['./**/*.scss','!./node_modules/**/*.scss'], gulp.series('sass', function() {
        // Do something after a, b, and c are finished.
    }));
});


// 使用 gulp.task('default') 定义默认任务
// 在命令行使用 gulp 启动 sass 任务和 auto 任务
gulp.task('default', gulp.series('sass', function() {
  // Do something after a, b, and c are finished.
}))