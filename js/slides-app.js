/**
 * Created by kintesh on 24/02/15.
 */

var SlidesApp = (function($) {

    var APP_NAME = "Slides App",
        DEFAULT_FILENAME = "untitled";

    var SAVED = 1,
        UNSAVED = 2;

    var gui = require("nw.gui"),
        win = gui.Window.get(),
        menu = new gui.Menu({type:"menubar"}),
        path = require("path"),
        fs = require("fs"),
        fsx = require("fs-extra"),
        slides = require("slides");
    var fileOpenDialog, fileSaveDialog, editor, editorState, liveView,
        currFilePath = null, currFileName, slidesModuleDir;

    function init() {
        win.title = APP_NAME;
        if (process.platform === "darwin") {
            menu.createMacBuiltin(APP_NAME, {
                hideEdit: false,
                hideWindow: false
            });
        }
        win.menu = menu;
        slidesModuleDir = path.join(path.resolve(), "node_modules/slides");
        initMenu();
        editor = $("#editor");
        liveView = $("#liveView");
        resetEditor();

        editor.bind("blur", function() {
            setTimeout(function() {
                editor.focus();
            }, 0);
        });
    }

    function initMenu() {
        $("#btnNew").click(function() {
            if(editorState === SAVED) {
                resetEditor();
            } else {
                if (confirm("Current file is not saved.\nContinue without saving?")) {
                    resetEditor();
                } else {
                    $("#btnSave").trigger("click");
                }
            }
        });

        $("#btnOpen").click(function() {
            if(editorState === SAVED) {
                fileOpenDialog.trigger("click");
            } else {
                if (confirm("Current file is not saved.\nContinue without saving?")) {
                    fileOpenDialog.trigger("click");
                } else {
                    $("#btnSave").trigger("click");
                }
            }
        });

        $("#btnSave").click(function() {
            if(currFilePath != null) {
                fileSaveDialog.prop("nwsaveas", currFilePath);
                saveFile(currFilePath);
            } else {
                fileSaveDialog.prop("nwsaveas", currFileName);
                fileSaveDialog.trigger("click");
            }
        });

        $("#btnPreview").click(function() {
            slides(replaceRelativePath(editor.val()), function(err, res) {
                if(err == null) {
                    openPreviewWindow(res.offline);
                }
            });
        });

        $("#btnExportOnline").click(function() {
            if(editorState == SAVED && currFilePath != null) {
                exportOnline();
            } else {
                alert("You must save current edit before exporting.")
            }
        });

        $("#btnExportOffline").click(function() {
            if(editorState == SAVED && currFilePath != null) {
                exportOffline();
            } else {
                alert("You must save current edit before exporting.")
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

    function updateWindowTitle() {
        if(editorState == SAVED) {
            win.title = APP_NAME + " - " + currFileName + ((currFilePath != null) ? " [" + currFilePath + "]" : "");
        } else {
            win.title = APP_NAME + " - " + currFileName + "*" + ((currFilePath != null) ? " [" + currFilePath + "]" : "");
        }
    }

    function resetEditor() {
        editorState = SAVED;
        editor.val("");
        fileOpenDialog.val("");
        fileSaveDialog.val("");
        liveView.prop("srcdoc", "");
        currFilePath = null;
        currFileName = DEFAULT_FILENAME;
        updateWindowTitle();
    }

    function openFile(file) {
        fs.exists(file, function(res) {
            if(res) {
                fs.readFile(file, function(err, data) {
                    if(err == null) {
                        resetEditor();
                        editor.val(data);
                        currFilePath = file;
                        currFileName = path.basename(file);
                        updateWindowTitle();
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
                editorState = SAVED;
                currFilePath = file;
                currFileName = path.basename(file);
                updateWindowTitle();
            }
        });
    }

    function editorInput() {
        editorState = UNSAVED;
        updateWindowTitle();
        updateLiveView();
    }

    function editorClick() {
        updateLiveView();
    }

    function updateLiveView() {
        getEditFrame(replaceRelativePath(editor.val()), editor[0].selectionStart,
            function(err, res) {
                if(err == null) {
                    slides(res, function(err, res) {
                        if(err == null) {
                            liveView.prop("srcdoc", getLiveViewSrcdoc(res.html));
                        }
                    });
                }
            }
        );
    }

    function getLiveViewSrcdoc(body) {
        return "<!DOCTYPE html><html><head lang=\"en\"><meta charset=\"UTF-8\">" +
            "<link rel=\"stylesheet\" href=\""+slidesModuleDir+"/assets/css/slides.css\">" +
            "<link rel=\"stylesheet\" href=\""+slidesModuleDir+"/assets/css/style.css\">" +
            "<link rel=\"stylesheet\" href=\""+slidesModuleDir+"/assets/css/animations.css\">" +
            "<script type=\"text/javascript\" src=\""+slidesModuleDir+"/assets/js/MathJax/MathJax.js?" +
            "config=TeX-AMS-MML_HTMLorMML\"></script></head><body>"+body+"</body></html>";
    }

    function replaceRelativePath(input) {
        if(currFilePath != null) {
            return input.replace(/\.\//g, path.dirname(currFilePath)+"/");
        } else {
            return input;
        }
    }

    function getEditFrame(input, index, callback) {
        if(index > 0) {
            var temp = "";
            var foundStart = false;
            for(var b=index; b>=0; b--) {
                if (input.slice(b-4, b) === "====" && input.charAt(b-5) !== "\\") {
                    temp = input.slice(b-4, index);
                    foundStart = true;
                    break;
                }
            }
            if(foundStart) {
                var foundEnd = false;
                for (var f = index; f <= input.length; f++) {
                    if (input.charAt(f) === "=") {
                        if (/\s*={4}\s*/.exec(input.slice(f, f + 4)) != null && input.charAt(f-1) !== "\\") {
                            temp += input.slice(index, f + 4);
                            foundEnd = true;
                            break;
                        }
                    }
                }
                if(!foundEnd)
                    temp = "";
            }
            callback(null, temp);
        } else {
            callback("ERR", null);
        }
    }

    function openPreviewWindow(content) {
        content = content.replace(/\.\/slides_assets/g, slidesModuleDir+"/assets");
        var previewWin = gui.Window.open("preview", {
            toolbar: false,
            "width": 900,
            "height": 600,
            "icon": "./img/slides.png"
        });
        previewWin.on('loaded', function(){
            previewWin.focus();
            previewWin.window.document.open();
            previewWin.window.document.write(content);
            previewWin.window.document.close();
        });
    }

    function exportOnline() {
        slides(editor.val(), function(err, res) {
            if(err == null) {
                var outFile = path.join(path.dirname(currFilePath), "slides_"+currFileName+".html");
                fs.writeFile(outFile, res.online, "utf8", function(err) {
                    if(!err) {
                        alert("Slides exported for online use to:\n" + path.dirname(outFile));
                    } else {
                        alert("Error exporting slides.\n Please try again.");
                    }
                });
            } else {
                alert("Error marking slides.\n Check if preview works correctly.");
            }
        });
    }

    function exportOffline() {
        slides(editor.val(), function(err, res) {
            if(err == null) {
                var srcAssets = path.join(slidesModuleDir, "assets");
                var outAssets = path.join(path.dirname(currFilePath), "slides_assets");
                fsx.copy(srcAssets, outAssets, function(err) {
                    if(!err) {
                        var outFile = path.join(path.dirname(currFilePath), "slides_"+currFileName+".html");
                        fs.writeFile(outFile, res.offline, "utf8", function(err) {
                            if(!err) {
                                alert("Slides exported for online use to:\n" + path.dirname(outFile));
                            } else {
                                alert("Error exporting slides.\n Please try again.");
                            }
                        });
                    } else {
                        alert("Error copying slides assets.\n Please try again.");
                    }
                });
            } else {
                alert("Error marking slides.\n Check if preview works correctly.");
            }
        });
    }

    return {
        init:init,
        editorInput:editorInput,
        editorClick:editorClick
    }
})(jQuery);


$(document).ready(function() {
    SlidesApp.init();
});
