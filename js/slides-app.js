/**
 * Created by kintesh on 24/02/15.
 */

var SlidesApp = (function($) {

    var APP_NAME = "Slides App";

    var gui = require("nw.gui"),
        win = gui.Window.get(),
        menu = new gui.Menu({type:"menubar"});

    function init() {
        win.title = APP_NAME;
        if (process.platform === "darwin") {
            menu.createMacBuiltin(APP_NAME, {
                hideEdit: false,
                hideWindow: false
            });
        }
        win.menu = menu;
    }

    return {
        init:init
    }
})(jQuery);


$(document).ready(function() {
    SlidesApp.init();
});
