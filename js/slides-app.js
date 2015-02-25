/**
 * Created by kintesh on 24/02/15.
 */

var SlidesApp = (function($) {

    function log(s) {
        console.dir(s);
    }

    var APP_NAME = "Slides App",
        DEF_FILE_NAME = "untitled";

    var gui = require("nw.gui"),
        win = gui.Window.get(),
        menu = new gui.Menu({ type: "menubar" }),
        slides = require("slides"),
        path = require("path"),
        fs = require("fs");
    var editor, preview, editorSaved, filePath, fileName;
    var fileOpenDialog, fileSaveDialog;

    function init() {
        log("init");
        win.title = APP_NAME;
        if (process.platform === "darwin") {
            menu.createMacBuiltin(APP_NAME, {
                hideEdit: false,
                hideWindow: false
            });
        }
        win.menu = menu;
        editorSaved = true;
        initMenu();
        editor = $("#editor");
        preview = $("#preview");
        newFile();
    }

    function editorChanged() {
        editorSaved = false;
        win.title = APP_NAME + " - " + fileName +"*" + ((filePath!=undefined) ? " ["+filePath+"]" : "");
        update();
    }

    function editorClick() {
        update();
    }

    function update() {
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

    function initMenu() {
        $("#btnNew").click(function() {
            newFile();
        });

        $("#btnOpen").click(function() {
            if(editorSaved) {
                fileOpenDialog.trigger("click");
            } else {
                if (confirm("Current file not saved.\nContinue without saving?")) {
                    fileOpenDialog.trigger("click");
                } else {
                    $("#btnSave").trigger("click");
                }
            }
        });

        $("#btnSave").click(function() {
            if(filePath != null) {
                fileSaveDialog.prop("nwsaveas", filePath);
                saveFile(filePath);
            } else {
                fileSaveDialog.prop("nwsaveas", fileName);
                fileSaveDialog.trigger("click");
            }
        });

        fileOpenDialog = $("#fileOpenDialog").change(function() {
            openFile($(this).val());
            $(this).val("");
        });

        fileSaveDialog = $("#fileSaveDialog").change(function() {
            saveFile($(this).val());
            $(this).val("");
        });
    }

    function newFile() {
        if(editorSaved) {
            resetEditor();
        } else {
            if (confirm("Current file not saved.\nContinue without saving?")) {
                resetEditor();
            } else {
                $("#btnSave").trigger("click");
            }
        }
    }

    function resetEditor() {
        editorSaved = true;
        filePath = null;
        fileName = DEF_FILE_NAME;
        editor.val("");
        win.title = APP_NAME + " - " + fileName + ((filePath!=undefined) ? " ["+filePath+"]" : "");
        fileOpenDialog.val("");
        fileSaveDialog.val("");
        update();
    }

    function openFile(file) {
        fs.exists(file, function (res) {
            if(res == true) {
                fs.readFile(file, function(err, res) {
                    if(err == null) {
                        editor.val(res);
                        editorSaved = true;
                        filePath = file;
                        fileName = path.basename(file);
                        win.title = APP_NAME + " - " + fileName + ((file!=null) ? " ["+file+"]" : "");
                    }
                });
            } else {
                alert("File does not exist.");
            }

        })
    }

    function saveFile(file) {
        fs.writeFile(file, editor.val(), "utf8", function(err, res) {
            if(!err) {
                editorSaved = true;
                filePath = file;
                fileName = path.basename(file);
                win.title = APP_NAME + " - " + fileName + ((file!=null) ? " ["+file+"]" : "");
            }
        })
    }

    return {
        init:init,
        editorChanged:editorChanged,
        editorClick:editorClick
    }

})(jQuery);


$( document ).ready(function() {
    SlidesApp.init();
});

