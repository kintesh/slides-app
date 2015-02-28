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
        fsx = require("fs-extra");
    var fileOpenDialog, fileSaveDialog, editor, editorState, preview,
        currFilePath = null, currFileName;

    function init() {
        win.title = APP_NAME;
        if (process.platform === "darwin") {
            menu.createMacBuiltin(APP_NAME, {
                hideEdit: false,
                hideWindow: false
            });
        }
        win.menu = menu;
        initMenu();
        editor = $("#editor");
        preview = $("#preview");
        resetEditor();
    }

    function initMenu() {
        $("#btnNew").click(function() {
            console.dir("btnNew")
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
            console.dir("btnOpen")
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
            console.dir("btnSave")
            if(currFilePath != null) {
                fileSaveDialog.prop("nwsaveas", currFilePath);
                saveFile(currFilePath);
            } else {
                fileSaveDialog.prop("nwsaveas", currFileName);
                fileSaveDialog.trigger("click");
            }
        });

        $("#btnPreview").click(function() {
            console.dir("btnPreview")
        });

        $("#btnExportOnline").click(function() {
            console.dir("btnExportOnline")
        });

        $("#btnExportOffline").click(function() {
            console.dir("btnExportOffline")
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
        preview.prop("srcdoc", "");
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
        console.dir("editorInput")
        editorState = UNSAVED;
        updateWindowTitle();
    }

    function editorClick() {
        console.dir("editorInput")
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
