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

    function getWindowTitle() {
        if(editorSaved) {
            return APP_NAME + " - " + fileName + ((filePath!=undefined) ? " [" + filePath + "]" : "");
        } else {
            return APP_NAME + " - " + fileName + "*" + ((filePath != undefined) ? " [" + filePath + "]" : "");
        }
    }

    function editorChanged() {
        editorSaved = false;
        win.title = getWindowTitle();
        update();
    }

    function editorClick() {
        update();
    }

    function update() {
        getEditFrame(replaceRelativePath(editor.val()), editor[0].selectionStart,
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

    function replaceRelativePath(input) {
        if(filePath != null) {
            return input.replace("./", path.dirname(filePath)+"/");
        } else {
            return input;
        }
    }

    function getEditFrame(input, index, callback) {
        if(index > 0) {
            var temp = "";
            // Look backwards
            for(var b=index; b>0; b--) {
                if(input.charAt(b) === "=" && (b-4)>0) {
                    if(input.charAt(b-1) === "="
                        && input.charAt(b-2) === "="
                        && input.charAt(b-3) === "=") {
                        temp+=input.slice(b-3, index);
                        break;
                    }
                }
            }
            if(temp !== "") {
                // Look forwards
                for (var f=index; f<input.length; f++) {
                    if (input.charAt(f) === "=" && (f+4)<input.length) {
                        if (input.charAt(f+1) === "="
                            && input.charAt(f+2) === "="
                            && input.charAt(f+3) === "=") {
                            temp += input.slice(index, f + 4);
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
            "<link rel=\"stylesheet\" href=\"./slides_assets/css/slides.css\">" +
            "<script type=\"text/javascript\" src=\"./slides_assets/js/MathJax/MathJax.js?config=TeX-AMS-MML_HTMLorMML\"></script>" +
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

        $("#btnPreview").click(function() {
            slides(replaceRelativePath(editor.val()), function(err, res) {
                if(err == null) {
                    openPreviewWindow(res.html);
                }
            });
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
        win.title = getWindowTitle();
        fileOpenDialog.val("");
        fileSaveDialog.val("");
        preview.prop("srcdoc", "");
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
                        win.title = getWindowTitle();
                    }
                });
            } else {
                alert("File does not exist.");
            }
        });
    }

    function saveFile(file) {
        fs.writeFile(file, editor.val(), "utf8", function(err) {
            if(!err) {
                editorSaved = true;
                filePath = file;
                fileName = path.basename(file);
                win.title = getWindowTitle();
            }
        });
    }

    function openPreviewWindow(content) {
        var previewWin = gui.Window.open("preview", {
            toolbar: false
        });
        previewWin.on('loaded', function(){
            previewWin.focus();
            previewWin.window.document.open();
            previewWin.window.document.write(content);
            previewWin.window.document.close();
        });
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

