var gulp = require("gulp");

gulp.task("build", function() {

    var NwBuilder = require("node-webkit-builder");
    var nw = new NwBuilder({
        files: [
            "./**/**",
            "!./build/**/**",
            "!./cache/**/**",
            "!./**/**/gulp/**/**",
            "!./**/**/node-webkit-builder/**/**"
        ],
        platforms: ["osx32", "osx64", "win32", "win64"],
        macIcns: "./img/slides.icns"
        //winIco: "./img/slides.ico"
    });

    nw.on("log",  console.log);

    nw.build().then(function () {
        console.log("all done!");
    }).catch(function (error) {
        console.error(error);
    });
});

gulp.task("default", ["build"]);