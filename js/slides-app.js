/**
 * Created by kintesh on 24/02/15.
 */

var SlidesApp = (function($) {

    function log(s) {
        console.dir(s);
    }

    var slides = require("slides");
    var editor, preview;

    function init() {
        log("init");

        editor = $("#editor");
        preview = $("#preview");
    }

    function update() {
        log("update");

        getEditFrame(editor.val(), editor[0].selectionStart,
            function(err, res) {
                if(err == null) {
                    slides(res, function(err, res) {
                        if(err == null) {
                            preview.prop("srcdoc", getIFrameSrcdoc(res.body));
                        }
                    });
                }
            }
        );

    }


    function getEditFrame(input, index, callback) {
        if(index > 0) {
            var temp = "";
            // Look backwards
            for(var i=index; i>0; i--) {
                if(input.charAt(i) === "=" && (i-4)>0) {
                    if(input.charAt(i-1) === "="
                        && input.charAt(i-2) === "="
                        && input.charAt(i-3) === "=") {
                        temp+=input.slice(i-3, index);
                        break;
                    }
                }
            }
            if(temp !== "") {
                // Look forwards
                for (var i=index; i < input.length; i++) {
                    if (input.charAt(i) === "=" && (i+4)<input.length) {
                        if (input.charAt(i+1) === "="
                            && input.charAt(i+2) === "="
                            && input.charAt(i+3) === "=") {
                            temp += input.slice(index, i + 4);
                            break;
                        }
                    }
                }
            }
            callback(null, temp);
        } else {
            callback("ERR", null);
        }
    }

    function getIFrameSrcdoc(body) {
        return "<!DOCTYPE html><html><head lang=\"en\"><meta charset=\"UTF-8\">" +
            "<link rel=\"stylesheet\" href=\"./assets/css/slides.css\">" +
            "<script type=\"text/javascript\" src=\"./assets/js/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML\"></script>" +
            "</head><body>"+body+"</body></html>";
    }


    return {
        init:init,
        update:update
    }

})(jQuery);


$( document ).ready(function() {
    SlidesApp.init();
});

