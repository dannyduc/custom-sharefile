 // jQuery Alert Dialogs Plugin 1.1.1sf
(function(a) {
    a.alerts = {verticalOffset: -75,horizontalOffset: 0,repositionOnResize: !0,overlayOpacity: 0.01,overlayColor: "#FFF",draggable: !1,okButton: "&nbsp;OK&nbsp;",cancelButton: "&nbsp;Cancel&nbsp;",dialogClass: null,isCust: !0,altPanel: "",alert: function(b, c, d, e) {
            null == c && (c = "Alert");
            a.alerts._show(c, b, null, "alert", d, e)
        },alertCust: function(b, c, d, e, g, h) {
            null == c && (c = "Alert");
            a.alerts.isCust = e;
            a.alerts.altPanel = g;
            a.alerts._show(c, b, null, "alert-cust", d, h);
            a.alerts.isCust = !1
        },confirm: function(b, c, d, e) {
            null == 
            c && (c = "Confirm");
            a.alerts._show(c, b, null, "confirm", d, e)
        },prompt: function(b, c, d, e, g) {
            null == d && (d = "Prompt");
            a.alerts._show(d, b, c, "prompt", e, g)
        },_currentCallback: null,_doCallback: function(b) {
            a.alerts._currentCallback && a.alerts._currentCallback(b)
        },_finishEvent: function(b) {
            void 0 === b && (b = !0);
            a.alerts._hide();
            a.alerts._doCallback(b)
        },_show: function(b, c, d, e, g, h) {
            a.alerts._currentCallback = h || null;
            a.alerts._hide();
            a.alerts._overlay("show");
            a.alerts.dialogClass = g ? g : null;
            a("BODY").append('<div id="popup_container"><h1 id="popup_title"></h1><div id="popup_content"><div id="popup_message"></div></div></div>');
            a.alerts.dialogClass && a("#popup_container").addClass(a.alerts.dialogClass);
            var g = a.browser.msie && 6 >= parseInt(a.browser.version) ? "absolute" : "fixed", f = a("#popup_container").css({position: g,zIndex: 99999,padding: 0,margin: 0});
            a("#popup_title").text(b);
            a("#popup_content").addClass(e);
            a("#popup_message").text(c);
            a("#popup_message").html(a("#popup_message").text());
            f.css({minWidth: a("#popup_container").outerWidth(),maxWidth: a("#popup_container").outerWidth()});
            a.alerts._reposition();
            a.alerts._maintainPosition(!0);
            switch (e) {
                case "alert":
                    a("#popup_message").after('<div id="popup_panel"><input type="button" value="' + a.alerts.okButton + '" id="popup_ok" class="popup_ok" /></div>');
                    f.find(".popup_ok").click(function() {
                        a.alerts._finishEvent(!0)
                    }).focus().keypress(function(a) {
                        (13 == a.keyCode || 27 == a.keyCode) && f.find(".popup_ok").trigger("click")
                    });
                    break;
                case "alert-cust":
                    a.alerts.isCust && a("#popup_message").after('<div id="popup_panel" class="noDec">' + a.alerts.altPanel + "</div>");
                    f.find(".popup_ok").click(function() {
                        var b = 
                        a(this).attr("data-arg") || !0;
                        a.alerts._finishEvent(b)
                    }).keypress(function(a) {
                        (13 == a.keyCode || 27 == a.keyCode) && f.find(".popup_ok").trigger("click")
                    }).eq(0).focus();
                    break;
                case "confirm":
                    a("#popup_message").after('<div id="popup_panel"><input type="button" value="' + a.alerts.okButton + '" id="popup_ok" class="popup_ok" /> <input type="button" value="' + a.alerts.cancelButton + '" id="popup_cancel" class="popup_cancel" /></div>');
                    f.find(".popup_ok").click(function() {
                        a.alerts._finishEvent(!0)
                    });
                    f.find(".popup_cancel").click(function() {
                        a.alerts._finishEvent(!1)
                    });
                    f.find(".popup_ok").focus();
                    f.find(".popup_ok, .popup_cancel").keypress(function(a) {
                        13 == a.keyCode && f.find(".popup_ok").trigger("click");
                        27 == a.keyCode && f.find(".popup_cancel").trigger("click")
                    });
                    break;
                case "prompt":
                    a("#popup_message").append('<br /><input type="text" size="30" id="popup_prompt" />').after('<div id="popup_panel"><input type="button" value="' + a.alerts.okButton + '" id="popup_ok" class="popup_ok" /> <input type="button" value="' + a.alerts.cancelButton + '" id="popup_cancel" class="popup_cancel" /></div>'), 
                    a("#popup_prompt").width(a("#popup_message").width()), f.find(".popup_ok").click(function() {
                        var b = a("#popup_prompt").val();
                        a.alerts._finishEvent(b)
                    }), f.find(".popup_cancel").click(function() {
                        a.alerts._finishEvent(null)
                    }), f.find("#popup_prompt, .popup_ok, .popup_cancel").keypress(function(a) {
                        13 == a.keyCode && f.find(".popup_ok").trigger("click");
                        27 == a.keyCode && f.find(".popup_cancel").trigger("click")
                    }), d && a("#popup_prompt").val(d), a("#popup_prompt").focus().select()
            }
            if (a.alerts.draggable)
                try {
                    a("#popup_container").draggable({handle: a("#popup_title")}), 
                    a("#popup_title").css({cursor: "move"})
                } catch (i) {
                }
        },_hide: function() {
            a("#popup_container").remove();
            a.alerts._overlay("hide");
            a.alerts._maintainPosition(!1)
        },_overlay: function(b) {
            switch (b) {
                case "show":
                    a.alerts._overlay("hide");
                    a("BODY").append('<div id="popup_overlay"></div>');
                    a("#popup_overlay").css({position: "absolute",zIndex: 99998,top: "0px",left: "0px",width: "100%",height: a(document).height(),background: a.alerts.overlayColor,opacity: a.alerts.overlayOpacity});
                    break;
                case "hide":
                    a("#popup_overlay").remove()
            }
        },
        _reposition: function() {
            var b = a(window).height() / 2 - a("#popup_container").outerHeight() / 2 + a.alerts.verticalOffset, c = a(window).width() / 2 - a("#popup_container").outerWidth() / 2 + a.alerts.horizontalOffset;
            0 > b && (b = 0);
            0 > c && (c = 0);
            a.browser.msie && 6 >= parseInt(a.browser.version) && (b += a(window).scrollTop());
            a("#popup_container").css({top: b + "px",left: c + "px"});
            a("#popup_overlay").height(a(document).height())
        },_maintainPosition: function(b) {
            if (a.alerts.repositionOnResize)
                switch (b) {
                    case !0:
                        a(window).bind("resize", a.alerts._reposition);
                        break;
                    case !1:
                        a(window).unbind("resize", a.alerts._reposition)
                }
        }};
    jAlert = function(b, c, d, e) {
        a.alerts.alert(b, c, d, e)
    };
    jAlertC = function(b, c, d, e, g, h) {
        a.alerts.alertCust(b, c, d, e, g, h)
    };
    jConfirm = function(b, c, d, e) {
        a.alerts.confirm(b, c, d, e)
    };
    jPrompt = function(b, c, d, e, g) {
        a.alerts.prompt(b, c, d, e, g)
    }
})(jQuery);
