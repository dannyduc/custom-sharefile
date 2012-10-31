 /* jQuery Tooltip plugin 1.3.jq143sf (jQuery 1.4.3 Compatible) */
(function(b) {
    function r(c) {
        if (!a.parent) {
            var d = b("#innerBody");
            if (d == null)
                d = document.body;
            a.parent = b('<div id="' + c.id + '" style="left: -9999em"><h3></h3><div class="body"></div><div class="url"></div></div>').appendTo(d).hide();
            b.fn.bgiframe && a.parent.bgiframe();
            a.title = b("h3", a.parent);
            a.body = b("div.body", a.parent);
            a.url = b("div.url", a.parent)
        }
    }
    function h(c) {
        return b.data(c, "tooltip")
    }
    function l(c) {
        return b("body").data("tip-" + c)
    }
    function s(c, d, e) {
        d = e ? l(e) : h(this);
        if (d.delay)
            o = setTimeout(function() {
                t(c, e)
            }, d.delay);
        else
            t(c, e);
        u = !!d.track;
        b(document.body).bind("mousemove", n);
        n(c, e)
    }
    function v() {
        if (!(b.tooltip.blocked || this == j || !this.tooltipText && !h(this).bodyHandler)) {
            var c;
            if (h(this).bodyHandler)
                c = h(this).bodyHandler.call(this);
            if (elem.tooltipText || c) {
                j = this;
                m = this.tooltipText;
                if (cSet.bodyHandler && c) {
                    a.title.hide();
                    c.nodeType || c.jquery ? a.body.empty().append(c) : a.body.html(c);
                    a.body.show()
                } else if (h(this).showBody) {
                    c = m.split(h(this).showBody);
                    a.title.html(c.shift()).show();
                    a.body.empty();
                    for (var d = 0, e; e = c[d]; d++) {
                        d > 0 && a.body.append("<br/>");
                        a.body.append(e)
                    }
                    a.body.hideWhenEmpty()
                } else {
                    a.title.html(m).show();
                    a.body.hide()
                }
                h(this).showURL && b(this).url() ? a.url.html(b(this).url().replace("http://", "")).show() : a.url.hide();
                a.parent.addClass(h(this).extraClass);
                h(this).fixPNG && a.parent.fixPNG();
                s.apply(this, arguments)
            }
        }
    }
    function w(c, d, e) {
        var f = l(e);
        d.tOpacity = a.parent.css("opacity");
        if (!d.tooltipText) {
            d.tooltipText = d.title;
            b(d).attr("title", "");
            d.alt = ""
        }
        if (!(b.tooltip.blocked || d == j || !d.tooltipText && !f.bodyHandler)) {
            var g;
            if (f.bodyHandler)
                g = f.bodyHandler.call(d);
            if (d.tooltipText || g) {
                j = d;
                m = d.tooltipText;
                if (f.bodyHandler && g) {
                    a.title.hide();
                    if (g) {
                        g.nodeType || g.jquery ? a.body.empty().append(g) : a.body.html(g);
                        a.body.show()
                    }
                } else if (f.showBody) {
                    g = m.split(f.showBody);
                    a.title.html(g.shift()).show();
                    a.body.empty();
                    for (var i = 0, k; k = g[i]; i++) {
                        i > 0 && a.body.append("<br/>");
                        a.body.append(k)
                    }
                    a.body.hideWhenEmpty()
                } else {
                    a.title.html(m).show();
                    a.body.hide()
                }
                f.showURL && b(d).url() ? a.url.html(b(d).url().replace("http://", "")).show() : a.url.hide();
                a.parent.addClass(f.extraClass);
                f.fixPNG && a.parent.fixPNG();
                s.apply(this, arguments)
            }
        }
    }
    function t(c, d) {
        var e = d ? l(d) : h(j);
        o = null;
        if ((!p || !b.fn.bgiframe) && e.fade)
            if (a.parent.is(":animated"))
                a.parent.stop().show().fadeTo(e.fade, j.tOpacity);
            else
                a.parent.is(":visible") ? a.parent.fadeTo(e.fade, j.tOpacity) : a.parent.fadeIn(e.fade);
        else
            a.parent.show();
        n(c, d)
    }
    function n(c, d) {
        var e = d ? l(d) : h(j);
        if (!b.tooltip.blocked)
            if (!(c && c.target.tagName == "OPTION")) {
                !u && a.parent.is(":visible") && b(document.body).unbind("mousemove", n);
                if (j == null)
                    b(document.body).unbind("mousemove", n);
                else {
                    a.parent.removeClass("viewport-right").removeClass("viewport-bottom");
                    var f = a.parent[0].offsetLeft, g = a.parent[0].offsetTop;
                    if (c) {
                        f = c.pageX + e.left;
                        g = c.pageY + e.top;
                        var i = "auto";
                        if (e.positionLeft) {
                            i = b(window).width() - f;
                            f = "auto"
                        }
                        a.parent.css({left: f,right: i,top: g})
                    }
                    i = {x: b(window).scrollLeft(),y: b(window).scrollTop(),cx: b(window).width(),cy: b(window).height()};
                    var k = a.parent[0];
                    if (i.x + i.cx < k.offsetLeft + k.offsetWidth) {
                        f -= k.offsetWidth + 20 + e.left;
                        a.parent.css({left: f + "px"}).addClass("viewport-right")
                    }
                    if (i.y + i.cy < k.offsetTop + k.offsetHeight) {
                        g -= k.offsetHeight + 20 + e.top;
                        if (g < 0)
                            g = 0;
                        a.parent.css({top: g + "px"}).addClass("viewport-bottom")
                    }
                }
            }
    }
    function q(c, d) {
        function e() {
            a.parent.removeClass(f.extraClass).css({'left': "-9999em",'top': "","opacity": "","display": "none"})
        }
        if (!b.tooltip.blocked) {
            o && clearTimeout(o);
            j = null;
            var f = d ? l(d) : h(this);
            if ((!p || !b.fn.bgiframe) && f.fade)
                a.parent.is(":animated") ? a.parent.stop().fadeTo(f.fade, 0, e) : a.parent.stop().fadeOut(f.fade, e);
            else
                e();
            f.fixPNG && a.parent.unfixPNG()
        }
    }
    var a = {}, j, m, o, p = b.browser.msie && /MSIE\s(5\.5|6\.)/.test(navigator.userAgent), u = false;
    b.tooltip = {blocked: false,defaults: {delay: 200,fade: false,showURL: true,extraClass: "",top: 15,left: 15,id: "tooltip",parent: "#innerBody"},block: function() {
            b.tooltip.blocked = !b.tooltip.blocked
        },addSel: function(c, d) {
            var e = b.extend({}, b.tooltip.defaults, d);
            r(e);
            b("body").data("tip-" + c, e);
            b(e.parent).delegate(c, "hover", function(f) {
                if (f.type == "mouseover" || f.type == "mouseenter")
                    w(f, this, c);
                else if (f.type == "mouseout" || f.type == "mouseleave")
                    q(f, c)
            })
        },removeSel: function(c) {
            b(l(c).parent).undelegate(c, "hover");
            b("body").data("tip-" + c, null)
        }};
    b.fn.extend({tooltip: function(c) {
            c = b.extend({}, b.tooltip.defaults, c);
            r(c);
            return this.each(function() {
                b.data(this, "tooltip", c);
                this.tOpacity = a.parent.css("opacity");
                this.tooltipText = this.title;
                b(this).removeAttr("title");
                this.alt = ""
            }).mouseover(v).mouseout(q).click(q)
        },fixPNG: p ? function() {
            return this.each(function() {
                var c = b(this).css("backgroundImage");
                if (c.match(/^url\(["']?(.*\.png)["']?\)$/i)) {
                    c = RegExp.$1;
                    b(this).css({backgroundImage: "none",filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + c + "')"}).each(function() {
                        var d = b(this).css("position");
                        d != "absolute" && d != "relative" && b(this).css("position", "relative")
                    })
                }
            })
        } : function() {
            return this
        },unfixPNG: p ? function() {
            return this.each(function() {
                b(this).css({filter: "",backgroundImage: ""})
            })
        } : function() {
            return this
        },hideWhenEmpty: function() {
            return this.each(function() {
                b(this)[b(this).html() ? "show" : "hide"]()
            })
        },url: function() {
            return this.attr("href") || this.attr("src")
        }})
})(jQuery);
