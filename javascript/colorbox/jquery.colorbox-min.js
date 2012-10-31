 // ColorBox v1.3.16.1sf - Modified for ShareFile!
(function(b, E, ea) {
    function c(a, la) {
        var d = E.createElement("div");
        d.id = a ? k + a : !1;
        d.style.cssText = la || !1;
        return b(d)
    }
    function q(a, b) {
        b = "x" === b ? l.width() : l.height();
        return "string" === typeof a ? Math.round(/%/.test(a) ? b / 100 * parseInt(a, 10) : parseInt(a, 10)) : a
    }
    function fa() {
        a.maxHeight && (a.mh = q(a.maxHeight, "y") - s - x, a.h = a.h && a.h < a.mh ? a.h : a.mh);
        a.maxWidth && (a.mw = q(a.maxWidth, "x") - v - y, a.w = a.w && a.w < a.mw ? a.w : a.mw);
        a.h == a.mh && (a.w += 25);
        m.css({width: a.w,height: a.h})
    }
    function U(n) {
        return a.photo || /\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i.test(n)
    }
    function ga(a) {
        for (var d in a)
            b.isFunction(a[d]) && "on" !== d.substring(0, 2) && (a[d] = a[d].call(h));
        a.rel = a.rel || h.rel || "nofollow";
        a.href = b.trim(a.href || b(h).attr("href"));
        a.title = a.title || h.title;
        a.iframe && !1 == a.innerHeight && (a.innerHeight = "300");
        return a
    }
    function B(a, d) {
        d && d.call(h);
        b.event.trigger(a)
    }
    function ma() {
        var n, b = k + "Slideshow_", c = "click." + k, e, g;
        a.slideshow && i[1] && (e = function() {
            H.text(a.slideshowStop).unbind(c).bind(V, function() {
                if (f < i.length - 1 || a.loop)
                    n = setTimeout(d.next, a.slideshowSpeed)
            }).bind(W, 
            function() {
                clearTimeout(n)
            }).one(c + " " + O, g);
            j.removeClass(b + "off").addClass(b + "on");
            n = setTimeout(d.next, a.slideshowSpeed)
        }, g = function() {
            clearTimeout(n);
            H.text(a.slideshowStart).unbind([V, W, O, c].join(" ")).one(c, e);
            j.removeClass(b + "on").addClass(b + "off")
        }, a.slideshowAuto ? e() : g())
    }
    function X(n) {
        if (!P) {
            h = n;
            ga(b.extend(a, b.data(h, t)));
            i = b(h);
            f = 0;
            "nofollow" !== a.rel ? (i = b("." + I).filter(function() {
                return (b.data(this, t).rel || this.rel) === a.rel
            }), f = i.index(h), -1 === f && (i = i.add(h), f = i.length - 1)) : (i = b(h), f = 0);
            if (!z) {
                z = F = !0;
                j.show();
                if (a.returnFocus)
                    try {
                        h.blur(), b(h).one(ha, function() {
                            try {
                                this.focus()
                            } catch (a) {
                            }
                        })
                    } catch (c) {
                    }
                a.overlayClose && a.overlay && A.css({opacity: +a.opacity,cursor: a.overlayClose ? "pointer" : "auto"}).show();
                a.w = q(a.initialWidth, "x");
                a.h = q(a.initialHeight, "y");
                d.position(0);
                Q ? l.bind("resize." + R + " scroll." + R, function() {
                    A.css({width: l.width(),height: l.height(),top: l.scrollTop(),left: l.scrollLeft()})
                }).trigger("resize." + R) : C && A.css({height: b(E).height()});
                B(ia, a.onOpen);
                Y.add(S).hide();
                Z.html(a.close).show()
            }
            d.load(!0)
        }
    }
    var ja = {transition: "elastic",speed: 300,width: !1,initialWidth: "600",innerWidth: !1,maxWidth: !1,height: !1,initialHeight: "450",innerHeight: !1,maxHeight: !1,scalePhotos: !0,scrolling: !0,inline: !1,html: !1,iframe: !1,fastIframe: !0,photo: !1,href: !1,title: !1,rel: !1,opacity: 0.9,overlay: !0,preloading: !0,current: "image {current} of {total}",previous: "previous",next: "next",close: "close",open: !1,returnFocus: !0,loop: !0,slideshow: !1,slideshowAuto: !0,slideshowSpeed: 2500,slideshowStart: "start slideshow",slideshowStop: "stop slideshow",
        onOpen: !1,onLoad: !1,onComplete: !1,onCleanup: !1,onClosed: !1,overlayClose: !0,escKey: !0,arrowKey: !0,anchor: !1,anchorPreferX: "left",anchorPreferY: "bottom",anchorKeepOnScr: !0,confClose: !1,confDefaults: {icon: "errorIcon",subject: "Discard Changes",body: "You have unsaved changes. Are you sure you want to close without saving?",buttons: "",posURL: "",negURL: ""},confSettings: null}, t = "colorbox", k = "cbox", ia = k + "_open", W = k + "_load", V = k + "_complete", O = k + "_cleanup", ha = k + "_closed", T = k + "_purge", J = b.browser.msie && !b.support.opacity, 
    Q = J && 7 > b.browser.version, R = k + "_IE6", G = navigator.userAgent, C = b.browser.webkit && (null != G.match(/like Mac OS X/i) || G.match(/Android/i) || G.match(/Mobile Safari/i)) || G.match(/Opera M/i) || G.match(/Fennec/i) || G.match(/Silk\//i), A, j, D, w, $, aa, ba, ca, i, l, m, K, L, S, da, H, M, N, Z, ka, Y, a = {}, x, y, s, v, h, f, g, z, F, P = !1, d, I = k + "Element";
    d = b.fn[t] = b[t] = function(a, d) {
        var c = this, e;
        if (!c[0] && c.selector)
            return c;
        if (0 < c.length && (e = b.data(this[0], t), 1 == c.length && e && (!0 == e.open || !1 == e.open) && a.open))
            return a = null, X(this[0]), this;
        a = 
        a || {};
        d && (a.onComplete = d);
        if (!c[0] || void 0 === c.selector)
            c = b("<a/>"), a.open = !0;
        c.each(function() {
            b.data(this, t, b.extend({}, b.data(this, t) || ja, a));
            (c.length != 1 || !a.open) && b(this).addClass(I)
        });
        e = a.open;
        b.isFunction(e) && (e = e.call(c));
        e && X(c[0]);
        return c
    };
    d.init = function() {
        l = b(ea);
        j = c().attr({id: t,"class": J ? k + (Q ? "IE6" : "IE") : ""});
        A = c("Overlay", Q ? "position:absolute" : "").hide();
        D = c("Wrapper");
        w = c("Content").append(m = c("LoadedContent", "width:0; height:0; overflow:hidden"), L = c("LoadingOverlay").add(c("LoadingGraphic")), 
        c("TitleWrap").append(S = c("Title")), da = c("Current"), M = c("Next"), N = c("Previous"), H = c("Slideshow").bind(ia, ma), Z = c("Close"), c("FooterWrap").append(ka = c("Footer")));
        D.append(c().append(c("TopLeft"), $ = c("TopCenter"), c("TopRight")), c(!1, "clear:left").append(aa = c("MiddleLeft"), w, ba = c("MiddleRight")), c(!1, "clear:left").append(c("BottomLeft"), ca = c("BottomCenter"), c("BottomRight"))).children().children().css({"float": "left"});
        K = c(!1, "position:absolute; width:9999px; visibility:hidden; display:none");
        b("body").prepend(A, 
        j.append(D, K));
        w.children().hover(function() {
            b(this).addClass("hover")
        }, function() {
            b(this).removeClass("hover")
        }).addClass("hover");
        x = $.height() + ca.height() + w.outerHeight(!0) - w.height();
        y = aa.width() + ba.width() + w.outerWidth(!0) - w.width();
        s = m.outerHeight(!0);
        v = m.outerWidth(!0);
        j.css({"padding-bottom": x,"padding-right": y}).hide();
        M.click(function() {
            d.next()
        });
        N.click(function() {
            d.prev()
        });
        Z.click(function() {
            d.close()
        });
        Y = M.add(N).add(da).add(H);
        w.children().removeClass("hover");
        b("body").delegate("." + 
        I, "click", function(a) {
            0 !== a.button && "undefined" !== typeof a.button || (a.ctrlKey || a.shiftKey || a.altKey) || (a.preventDefault(), X(this))
        });
        A.click(function() {
            a.overlayClose && d.close()
        });
        b(E).bind("keydown", function(b) {
            z && (a.escKey && 27 === b.keyCode) && (b.preventDefault(), d.close());
            if (z && a.arrowKey && !F && i[1])
                if (37 === b.keyCode && (f || a.loop))
                    b.preventDefault(), N.click();
                else if (39 === b.keyCode && (f < i.length - 1 || a.loop))
                    b.preventDefault(), M.click()
        })
    };
    d.remove = function() {
        j.add(A).remove();
        b("." + I).die("click").removeData(t).removeClass(I)
    };
    d.position = function(d, c) {
        function g(a) {
            $[0].style.width = ca[0].style.width = w[0].style.width = a.style.width;
            L[0].style.height = L[1].style.height = w[0].style.height = aa[0].style.height = ba[0].style.height = a.style.height
        }
        var e;
        e = l.height();
        var f = a.h + s + x, i = a.w + v + y, r = Math.max(E.documentElement.clientHeight - a.h - s - x, 0) / 2 + l.scrollTop(), u = Math.max(l.width() - a.w - v - y, 0) / 2 + l.scrollLeft();
        C && (r = Math.max(b("body").height() - a.h - s - x, 0) / 2, u = Math.max(b("body").width() - a.w - v - y, 0) / 2);
        if (a.anchor) {
            var k = r, m = u, p = b(ea).scrollTop(), 
            u = b(E).height(), o = b(h).offset();
            o.bottom = o.top + b(h).height();
            o.right = o.left + b(h).width();
            if ("top" == a.anchorPreferY) {
                if (r = o.top - f + 5, C && 0 > r || !C && r < p)
                    r = o.bottom - 5
            } else if (r = o.bottom - 5, C && r + f > u || !C && r + f > p + e)
                r = o.top - f + 5;
            "left" == a.anchorPreferX ? (u = o.left - i + 5, 0 > u - i && (u = o.right - 5)) : (u = o.right - 5, u + i > b(E).width() && (u = o.left - i + 5));
            if (a.anchorKeepOnScr && !C)
                if (f + 20 > e)
                    r = k, u = m;
                else if (o.bottom < p || r < p)
                    r = p + 10;
                else if (o.top > p + e || r + f > p + e)
                    r = p + e - f - 10
        }
        e = j.width() === a.w + v && j.height() === a.h + s ? 0 : d;
        D[0].style.width = D[0].style.height = 
        "9999px";
        j.dequeue().animate({width: a.w + v,height: a.h + s,top: r,left: u}, {duration: e,complete: function() {
                g(this);
                F = false;
                D[0].style.width = a.w + v + y + "px";
                D[0].style.height = a.h + s + x + "px";
                c && c()
            },step: function() {
                g(this)
            }})
    };
    d.resizeTo = function(b, c) {
        z && (speed = "none" === a.transition ? 0 : a.speed, l.unbind("resize." + k), a.w = !0 === b ? a.w : b, a.h = !0 === c ? a.h : c, a.mw = a.w, a.mh = a.h, fa(), d.position(speed), l.bind("resize." + k, function() {
            d.position(0)
        }))
    };
    d.resize = function(b) {
        z && (b = b || {}, b.width && (a.w = q(b.width, "x") - v - y), b.innerWidth && 
        (a.w = q(b.innerWidth, "x")), m.css({width: a.w}), b.height && (a.h = q(b.height, "y") - s - x), b.innerHeight && (a.h = q(b.innerHeight, "y")), !b.innerHeight && !b.height && (b = m.wrapInner("<div style='overflow:auto'></div>").children(), a.h = b.height(), b.replaceWith(b.children())), fa(), d.position("none" === a.transition ? 0 : a.speed))
    };
    d.prep = function(n) {
        function h() {
            a.w = a.w || m.width();
            a.w = a.mw && a.mw < a.w ? a.mw : a.w;
            return a.w
        }
        function q() {
            a.h = a.h || m.height();
            a.h = a.mh && a.mh < a.h ? a.mh : a.h;
            return a.h
        }
        function e(c) {
            d.position(c, function() {
                var c, 
                e, n, h;
                e = i.length;
                var p, o;
                if (z) {
                    o = function() {
                        L.hide();
                        if (a.iframe && b.browser.webkit) {
                            var c = b(p);
                            c.css({overflow: "hidden",width: "99%"});
                            setTimeout(function() {
                                c.css({overflow: "auto",width: "100%"})
                            }, 1)
                        }
                        B(V, a.onComplete)
                    };
                    J && g && m.fadeIn(100);
                    S.html(a.title).add(m).show();
                    if (1 < e) {
                        if ("string" === typeof a.current && da.html(a.current.replace(/\{current\}/, f + 1).replace(/\{total\}/, e)).show(), M[a.loop || f < e - 1 ? "show" : "hide"]().html(a.next), N[a.loop || f ? "show" : "hide"]().html(a.previous), c = f ? i[f - 1] : i[e - 1], n = f < e - 1 ? 
                        i[f + 1] : i[0], a.slideshow && H.show(), a.preloading && (h = b.data(n, t).href || n.href, e = b.data(c, t).href || c.href, h = b.isFunction(h) ? h.call(n) : h, e = b.isFunction(e) ? e.call(c) : e, U(h) && (b("<img/>")[0].src = h), U(e)))
                            b("<img/>")[0].src = e
                    } else
                        Y.hide();
                    a.iframe ? (p = b("<iframe frameborder=0/>").addClass(k + "Iframe")[0], a.fastIframe ? o() : b(p).load(o), p.name = k + +new Date, p.src = a.href, a.scrolling || (p.scrolling = "no"), J && (p.allowTransparency = "true"), b(p).appendTo(m).one(T, function() {
                        p.src = "javascript:'';"
                    })) : o();
                    "fade" === a.transition ? 
                    j.fadeTo(s, 1, function() {
                        j[0].style.filter = ""
                    }) : j[0].style.filter = "";
                    l.bind("resize." + k, function() {
                        d.position(0)
                    })
                }
            })
        }
        if (z) {
            var s = "none" === a.transition ? 0 : a.speed;
            l.unbind("resize." + k);
            m.remove();
            m = c("LoadedContent").html(n);
            m.hide().appendTo(K.show()).css({width: h(),overflow: a.scrolling ? "auto" : "hidden"}).css({height: q()}).prependTo(w);
            K.hide();
            b(g).css({"float": "none"});
            if (Q)
                b("select").not(j.find("select")).filter(function() {
                    return "hidden" !== this.style.visibility
                }).css({visibility: "hidden"}).one(O, 
                function() {
                    this.style.visibility = "inherit"
                });
            "fade" === a.transition ? j.fadeTo(s, 0, function() {
                e(0)
            }) : e(s)
        }
    };
    d.load = function(n) {
        var j, l, e = d.prep;
        F = !0;
        g = !1;
        h = i[f];
        n || ga(b.extend(a, b.data(h, t)));
        B(T);
        B(W, a.onLoad);
        a.h = a.height ? q(a.height, "y") - s - x : a.innerHeight && q(a.innerHeight, "y");
        a.w = a.width ? q(a.width, "x") - v - y : a.innerWidth && q(a.innerWidth, "x");
        a.mw = a.w;
        a.mh = a.h;
        a.maxWidth && (a.mw = q(a.maxWidth, "x") - v - y, a.mw = a.w && a.w < a.mw ? a.w : a.mw);
        a.maxHeight && (a.mh = q(a.maxHeight, "y") - s - x, a.mh = a.h && a.h < a.mh ? a.h : a.mh);
        j = 
        a.href;
        L.show();
        a.inline ? (c().hide().insertBefore(b(j)[0]).one(T, function() {
            b(this).replaceWith(m.children())
        }), e(b(j))) : a.iframe ? e(" ") : a.html ? e(a.html) : U(j) ? (b(g = new Image).addClass(k + "Photo").error(function() {
            a.title = false;
            e(c("Error").text("This image could not be loaded"))
        }).load(function() {
            var b;
            g.onload = null;
            if (a.scalePhotos) {
                l = function() {
                    g.height = g.height - g.height * b;
                    g.width = g.width - g.width * b
                };
                if (a.mw && g.width > a.mw) {
                    b = (g.width - a.mw) / g.width;
                    l()
                }
                if (a.mh && g.height > a.mh) {
                    b = (g.height - a.mh) / g.height;
                    l()
                }
            }
            if (a.h)
                g.style.marginTop = Math.max(a.h - g.height, 0) / 2 + "px";
            if (i[1] && (f < i.length - 1 || a.loop)) {
                g.style.cursor = "pointer";
                g.onclick = function() {
                    d.next()
                }
            }
            if (J)
                g.style.msInterpolationMode = "bicubic";
            setTimeout(function() {
                e(g)
            }, 1)
        }), setTimeout(function() {
            g.src = j
        }, 1)) : j && K.load(j, function(a, d, n) {
            e(d === "error" ? c("Error").text("Request unsuccessful: " + n.statusText) : b(this).contents())
        })
    };
    d.next = function() {
        F || (f = f < i.length - 1 ? f + 1 : 0, d.load())
    };
    d.prev = function() {
        F || (f = f ? f - 1 : i.length - 1, d.load())
    };
    d.closeConfirmed = 
    function(b) {
        !0 === b && (b = "close");
        try {
            a.confSettings[b] && (m && m.length && a.iframe) && m.find("iframe").attr("src", a.confSettings[b])
        } catch (c) {
            b = "close"
        }
        return "close" == b ? d.close(null, !0) : !1
    };
    d.close = function(c, f) {
        if (z && !P) {
            if (a.confClose && !f) {
                if (b.alerts)
                    return a.confSettings.buttons ? jAlertC(a.confSettings.body, a.confSettings.subject, a.confSettings.icon, !0, a.confSettings.buttons, d.closeConfirmed) : jConfirm(a.confSettings.body, a.confSettings.subject, a.confSettings.icon, d.closeConfirmed), !1;
                if (!confirm(a.confSettings.body))
                    return !1
            }
            a.confClose = 
            !1;
            a.confSettings = b({}, a.confDefaults);
            P = !0;
            z = !1;
            B(O, a.onCleanup);
            l.unbind("." + k + " ." + R);
            A.fadeTo(200, 0);
            j.stop().fadeTo(300, 0, function() {
                j.add(A).css({opacity: 1,cursor: "auto"}).hide();
                B(T);
                m.remove();
                a.overlay && j.add(A).css({opacity: 1,cursor: "auto"}).hide();
                setTimeout(function() {
                    P = !1;
                    B(ha, a.onClosed)
                }, 1)
            })
        }
    };
    d.title = function(a) {
        S && S.html(a)
    };
    d.footer = function(a) {
        ka.html(a)
    };
    d.closeConfirmation = function(c, d) {
        null != c && (a.confClose = c);
        if (d || !a.confSettings)
            a.confSettings = b.extend(a.confDefaults, d)
    };
    d.element = 
    function() {
        return b(h)
    };
    d.settings = ja;
    b(d.init)
})(jQuery, document, this);
