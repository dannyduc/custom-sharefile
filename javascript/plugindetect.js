 /* PluginDetect v0.7.0 by Eric Gerds www.pinlady.net/PluginDetect [ onWindowLoaded isMinVersion getVersion onDetectionDone Java(OTF&NOTF) ] */var PluginDetect = {handler: function(c, b, a) {
        return function() {
            c(b, a)
        }
    },isDefined: function(b) {
        return typeof b != "undefined"
    },isArray: function(b) {
        return (b && b.constructor === Array)
    },isFunc: function(b) {
        return typeof b == "function"
    },isString: function(b) {
        return typeof b == "string"
    },num: function(a) {
        return (this.isString(a) && (/\d/).test(a))
    },getNumRegx: /[\d][\d\.\_,-]*/,splitNumRegx: /[\.\_,-]/g,getNum: function(b, c) {
        var d = this, a = d.num(b) ? (d.isDefined(c) ? new RegExp(c) : d.getNumRegx).exec(b) : null;
        return a ? a[0].replace(d.splitNumRegx, ",") : null
    },compareNums: function(h, f, d) {
        var e = this, c, b, a, g = parseInt;
        if (e.num(h) && e.num(f)) {
            if (e.isDefined(d) && d.compareNums) {
                return d.compareNums(h, f)
            }
            c = h.split(e.splitNumRegx);
            b = f.split(e.splitNumRegx);
            for (a = 0; a < Math.min(c.length, b.length); a++) {
                if (g(c[a], 10) > g(b[a], 10)) {
                    return 1
                }
                if (g(c[a], 10) < g(b[a], 10)) {
                    return -1
                }
            }
        }
        return 0
    },formatNum: function(b) {
        var c = this, a, d;
        if (!c.num(b)) {
            return null
        }
        d = b.replace(/\s/g, "").split(c.splitNumRegx).concat(["0", "0", "0", "0"]);
        for (a = 0; a < 4; a++) {
            if (/^(0+)(.+)$/.test(d[a])) {
                d[a] = RegExp.$2
            }
        }
        if (!(/\d/).test(d[0])) {
            d[0] = "0"
        }
        return d.slice(0, 4).join(",")
    },$$hasMimeType: function(a) {
        return function(d) {
            if (!a.isIE) {
                var c, b, e, f = a.isString(d) ? [d] : d;
                for (e = 0; e < f.length; e++) {
                    c = navigator.mimeTypes[f[e]];
                    if (c && (b = c.enabledPlugin)) {
                        if (b.name || b.description) {
                            return c
                        }
                    }
                }
            }
            return null
        }
    },findNavPlugin: function(g, d) {
        var a = this.isString(g) ? g : g.join(".*"), e = d === false ? "" : "\\d", b, c = new RegExp(a + ".*" + e + "|" + e + ".*" + a, "i"), f = navigator.plugins;
        for (b = 0; b < f.length; b++) {
            if (c.test(f[b].description) || c.test(f[b].name)) {
                return f[b]
            }
        }
        return null
    },AXO: window.ActiveXObject,getAXO: function(b, a) {
        var g = null, f, d = false, c = this;
        try {
            g = new c.AXO(b);
            d = true
        } catch (f) {
        }
        if (c.isDefined(a)) {
            delete g;
            return d
        }
        return g
    },convertFuncs: function(f) {
        var a, g, d, b = /^[\$][\$]/, c = {};
        for (a in f) {
            if (b.test(a)) {
                c[a] = 1
            }
        }
        for (a in c) {
            try {
                g = a.slice(2);
                if (g.length > 0 && !f[g]) {
                    f[g] = f[a](f)
                }
            } catch (d) {
            }
        }
    },initScript: function() {
        var $ = this, nav = navigator, userAgent = (nav && $.isString(nav.userAgent) ? nav.userAgent : ""), vendor = (nav && $.isString(nav.vendor) ? nav.vendor : "");
        $.convertFuncs($);
        $.isIE =  /*@cc_on!@*/false;
        $.IEver = $.isIE && ((/MSIE\s*(\d\.?\d*)/i).exec(userAgent)) ? parseFloat(RegExp.$1, 10) : -1;
        $.ActiveXEnabled = false;
        if ($.isIE) {
            var x, progid = ["Msxml2.XMLHTTP", "Msxml2.DOMDocument", "Microsoft.XMLDOM", "ShockwaveFlash.ShockwaveFlash", "TDCCtl.TDCCtl", "Shell.UIHelper", "Scripting.Dictionary", "wmplayer.ocx"];
            for (x = 0; x < progid.length; x++) {
                if ($.getAXO(progid[x], 1)) {
                    $.ActiveXEnabled = true;
                    break
                }
            }
            $.head = $.isDefined(document.getElementsByTagName) ? document.getElementsByTagName("head")[0] : null
        }
        $.isGecko = !$.isIE && $.isString(navigator.product) && (/Gecko/i).test(navigator.product) && (/Gecko\s*\/\s*\d/i).test(userAgent);
        $.GeckoRV = $.isGecko ? $.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(userAgent) ? RegExp.$1 : "0.9") : null;
        $.isSafari = !$.isIE && (/Safari\s*\/\s*\d/i).test(userAgent) && (/Apple/i).test(vendor);
        $.isChrome = !$.isIE && (/Chrome\s*\/\s*\d/i).test(userAgent);
        $.isOpera = !$.isIE && (/Opera\s*[\/]?\s*\d/i).test(userAgent);
        $.addWinEvent("load", $.handler($.runWLfuncs, $))
    },init: function(d, a) {
        var c = this, b;
        if (!c.isString(d)) {
            return -3
        }
        if (d.length == 1) {
            c.getVersionDelimiter = d;
            return -3
        }
        d = d.toLowerCase().replace(/\s/g, "");
        if (!c.isDefined(c[d])) {
            return -3
        }
        b = c[d];
        c.plugin = b;
        if (!c.isDefined(b.installed) || a == true) {
            b.installed = b.version = b.version0 = b.getVersionDone = null;
            b.$ = c
        }
        c.garbage = false;
        if (c.isIE && !c.ActiveXEnabled) {
            if (b !== c.java) {
                return -2
            }
        }
        return 1
    },fPush: function(b, a) {
        var c = this;
        if (c.isArray(a) && (c.isFunc(b) || (c.isArray(b) && b.length > 0 && c.isFunc(b[0])))) {
            a[a.length] = b
        }
    },callArray: function(b) {
        var c = this, a;
        if (c.isArray(b)) {
            for (a = 0; a < b.length; a++) {
                if (b[a] === null) {
                    return
                }
                c.call(b[a]);
                b[a] = null
            }
        }
    },call: function(c) {
        var b = this, a = b.isArray(c) ? c.length : -1;
        if (a > 0 && b.isFunc(c[0])) {
            c[0](b, a > 1 ? c[1] : 0, a > 2 ? c[2] : 0, a > 3 ? c[3] : 0)
        } else {
            if (b.isFunc(c)) {
                c(b)
            }
        }
    },$$isMinVersion: function(a) {
        return function(h, g, d, c) {
            var e = a.init(h), f, b = -1;
            if (e < 0) {
                return e
            }
            f = a.plugin;
            g = a.formatNum(typeof g == "number" ? g.toString() : (a.isString(g) ? a.getNum(g) : "0"));
            if (!a.num(g)) {
                return -3
            }
            if (f.getVersionDone != 1) {
                f.getVersion(d, c);
                if (f.getVersionDone === null) {
                    f.getVersionDone = 1
                }
            }
            a.cleanup();
            if (f.installed !== null) {
                b = f.installed <= 0.5 ? f.installed : (f.version === null ? 0 : (a.compareNums(f.version, g, f) >= 0 ? 1 : -1))
            }
            return b
        }
    },getVersionDelimiter: ",",$$getVersion: function(a) {
        return function(g, d, c) {
            var e = a.init(g), f, b;
            if (e < 0) {
                return null
            }
            f = a.plugin;
            if (f.getVersionDone != 1) {
                f.getVersion(d, c);
                if (f.getVersionDone === null) {
                    f.getVersionDone = 1
                }
            }
            a.cleanup();
            b = (f.version || f.version0);
            return b ? b.replace(a.splitNumRegx, a.getVersionDelimiter) : b
        }
    },cleanup: function() {
        var a = this;
        if (a.garbage && a.isDefined(window.CollectGarbage)) {
            window.CollectGarbage()
        }
    },addWinEvent: function(d, c) {
        var e = this, a = window, b;
        if (e.isFunc(c)) {
            if (a.addEventListener) {
                a.addEventListener(d, c, false)
            } else {
                if (a.attachEvent) {
                    a.attachEvent("on" + d, c)
                } else {
                    b = a["on" + d];
                    a["on" + d] = e.winHandler(c, b)
                }
            }
        }
    },winHandler: function(d, c) {
        return function() {
            d();
            if (typeof c == "function") {
                c()
            }
        }
    },WLfuncs: [0],runWLfuncs: function(a) {
        a.winLoaded = true;
        a.callArray(a.WLfuncs);
        if (a.onDoneEmptyDiv) {
            a.onDoneEmptyDiv()
        }
    },winLoaded: false,$$onWindowLoaded: function(a) {
        return function(b) {
            if (a.winLoaded) {
                a.call(b)
            } else {
                a.fPush(b, a.WLfuncs)
            }
        }
    },$$onDetectionDone: function(a) {
        return function(h, g, e, b) {
            var c = a.init(h), j, d;
            if (c == -3) {
                return -1
            }
            d = a.plugin;
            if (d.getVersionDone != 1) {
                j = a.isMinVersion ? a.isMinVersion(h, "0", e, b) : a.getVersion(h, e, b)
            }
            if (d.installed != -0.5 && d.installed != 0.5) {
                a.call(g);
                return 1
            }
            if (d !== a.java) {
                return 1
            }
            ;
            a.fPush(g, d.funcs);
            return 0;
            return 1
        }
    },div: null,divWidth: 50,pluginSize: 1,emptyDiv: function() {
        var c = this, a, d, b;
        if (c.div && c.div.childNodes) {
            for (a = c.div.childNodes.length - 1; a >= 0; a--) {
                b = c.div.childNodes[a];
                if (b && b.childNodes) {
                    for (d = b.childNodes.length - 1; d >= 0; d--) {
                        b.removeChild(b.childNodes[d])
                    }
                    c.div.removeChild(b)
                }
            }
        }
    },onDoneEmptyDiv: function() {
        var a = this;
        if (!a.winLoaded) {
            return
        }
        if (a.WLfuncs && a.WLfuncs.length > 0 && a.isFunc(a.WLfuncs[a.WLfuncs.length - 1])) {
            return
        }
        if (a.java) {
            if (a.java.OTF == 3) {
                return
            }
            if (a.java.funcs && a.java.funcs.length > 0 && a.isFunc(a.java.funcs[a.java.funcs.length - 1])) {
                return
            }
        }
        a.emptyDiv()
    },getObject: function(c, a) {
        var g, d = this, f = null, b = d.getContainer(c);
        try {
            if (b && b.firstChild) {
                f = b.firstChild
            }
            if (a && f) {
                f.focus()
            }
        } catch (g) {
        }
        return f
    },getContainer: function(a) {
        return (a && a[0] ? a[0] : null)
    },instantiate: function(i, c, f, a, j) {
        var l, m = document, h = this, q, p = m.createElement("span"), o, g, n = "/";
        var k = function(s, r) {
            var u = s.style, d, t;
            if (!u) {
                return
            }
            u.outline = "none";
            u.border = "none";
            u.padding = "0px";
            u.margin = "0px";
            u.visibility = "visible";
            if (h.isArray(r)) {
                for (d = 0; d < r.length; d = d + 2) {
                    try {
                        u[r[d]] = r[d + 1]
                    } catch (t) {
                    }
                }
                return
            }
        }, b = function() {
            var s, t = "pd33993399", r = null, d = (m.getElementsByTagName("body")[0] || m.body);
            if (!d) {
                try {
                    m.write('<div id="' + t + '">o<' + n + "div>");
                    r = m.getElementById(t)
                } catch (s) {
                }
            }
            d = (m.getElementsByTagName("body")[0] || m.body);
            if (d) {
                if (d.firstChild && h.isDefined(d.insertBefore)) {
                    d.insertBefore(h.div, d.firstChild)
                } else {
                    d.appendChild(h.div)
                }
                if (r) {
                    d.removeChild(r)
                }
            } else {
            }
        };
        if (!h.isDefined(a)) {
            a = ""
        }
        if (h.isString(i) && (/[^\s]/).test(i)) {
            q = "<" + i + ' width="' + h.pluginSize + '" height="' + h.pluginSize + '" ';
            for (o = 0; o < c.length; o = o + 2) {
                if (/[^\s]/.test(c[o + 1])) {
                    q += c[o] + '="' + c[o + 1] + '" '
                }
            }
            q += ">";
            for (o = 0; o < f.length; o = o + 2) {
                if (/[^\s]/.test(f[o + 1])) {
                    q += '<param name="' + f[o] + '" value="' + f[o + 1] + '" />'
                }
            }
            q += a + "<" + n + i + ">"
        } else {
            q = a
        }
        if (!h.div) {
            h.div = m.createElement("div");
            g = m.getElementById("plugindetect");
            if (g) {
                h.div = g
            } else {
                h.div.id = "plugindetect";
                b()
            }
            k(h.div, ["width", h.divWidth + "px", "height", (h.pluginSize + 3) + "px", "fontSize", (h.pluginSize + 3) + "px", "lineHeight", (h.pluginSize + 3) + "px", "verticalAlign", "baseline", "display", "block"]);
            if (!g) {
                k(h.div, ["position", "absolute", "right", "0px", "top", "0px"])
            }
        }
        if (h.div && h.div.parentNode) {
            h.div.appendChild(p);
            k(p, ["fontSize", (h.pluginSize + 3) + "px", "lineHeight", (h.pluginSize + 3) + "px", "verticalAlign", "baseline", "display", "inline"]);
            try {
                if (p && p.parentNode) {
                    p.focus()
                }
            } catch (l) {
            }
            try {
                p.innerHTML = q
            } catch (l) {
            }
            if (p.childNodes.length == 1) {
                k(p.childNodes[0], ["display", "inline"])
            }
            return [p]
        }
        return [null]
    },java: {mimeType: "application/x-java-applet",classID: "clsid:8AD9C840-044E-11D1-B3E9-00805F499D93",DTKclassID: "clsid:CAFEEFAC-DEC7-0000-0000-ABCDEFFEDCBA",DTKmimeType: ["application/java-deployment-toolkit", "application/npruntime-scriptable-plugin;DeploymentToolkit"],JavaVersions: [[1, 9, 2, 30], [1, 8, 2, 30], [1, 7, 2, 30], [1, 6, 1, 30], [1, 5, 1, 30], [1, 4, 2, 30], [1, 3, 1, 30]],searchJavaPluginAXO: function() {
            var h = null, a = this, c = a.$, g = [], j = [1, 5, 0, 14], i = [1, 6, 0, 2], f = [1, 3, 1, 0], e = [1, 4, 2, 0], d = [1, 5, 0, 7], b = false;
            if (!c.ActiveXEnabled) {
                return null
            }
            ;
            if (c.IEver >= a.minIEver) {
                g = a.searchJavaAXO(i, i, b);
                if (g.length > 0 && b) {
                    g = a.searchJavaAXO(j, j, b)
                }
            } else {
                if (g.length == 0) {
                    g = a.searchJavaAXO(f, e, false)
                }
            }
            if (g.length > 0) {
                h = g[0]
            }
            a.JavaPlugin_versions = [].concat(g);
            return h
        },searchJavaAXO: function(l, i, m) {
            var n, f, h = this.$, p, k, a, e, g, j, b, q = [];
            if (h.compareNums(l.join(","), i.join(",")) > 0) {
                i = l
            }
            i = h.formatNum(i.join(","));
            var o, d = "1,4,2,0", c = "JavaPlugin." + l[0] + "" + l[1] + "" + l[2] + "" + (l[3] > 0 ? ("_" + (l[3] < 10 ? "0" : "") + l[3]) : "");
            for (n = 0; n < this.JavaVersions.length; n++) {
                f = this.JavaVersions[n];
                p = "JavaPlugin." + f[0] + "" + f[1];
                g = f[0] + "." + f[1] + ".";
                for (a = f[2]; a >= 0; a--) {
                    b = "JavaWebStart.isInstalled." + g + a + ".0";
                    if (h.compareNums(f[0] + "," + f[1] + "," + a + ",0", i) >= 0 && !h.getAXO(b, 1)) {
                        continue
                    }
                    o = h.compareNums(f[0] + "," + f[1] + "," + a + ",0", d) < 0 ? true : false;
                    for (e = f[3]; e >= 0; e--) {
                        k = a + "_" + (e < 10 ? "0" + e : e);
                        j = p + k;
                        if (h.getAXO(j, 1) && (o || h.getAXO(b, 1))) {
                            q[q.length] = g + k;
                            if (!m) {
                                return q
                            }
                        }
                        if (j == c) {
                            return q
                        }
                    }
                    if (h.getAXO(p + a, 1) && (o || h.getAXO(b, 1))) {
                        q[q.length] = g + a;
                        if (!m) {
                            return q
                        }
                    }
                    if (p + a == c) {
                        return q
                    }
                }
            }
            return q
        },minIEver: 7,getFromMimeType: function(a) {
            var h, f, c = this.$, j = new RegExp(a), d, k, i = {}, e = 0, b, g = [""];
            for (h = 0; h < navigator.mimeTypes.length; h++) {
                k = navigator.mimeTypes[h];
                if (j.test(k.type) && k.enabledPlugin) {
                    k = k.type.substring(k.type.indexOf("=") + 1, k.type.length);
                    d = "a" + c.formatNum(k);
                    if (!c.isDefined(i[d])) {
                        i[d] = k;
                        e++
                    }
                }
            }
            for (f = 0; f < e; f++) {
                b = "0,0,0,0";
                for (h in i) {
                    if (i[h]) {
                        d = h.substring(1, h.length);
                        if (c.compareNums(d, b) > 0) {
                            b = d
                        }
                    }
                }
                g[f] = i["a" + b];
                i["a" + b] = null
            }
            if (!(/windows|macintosh/i).test(navigator.userAgent)) {
                g = [g[0]]
            }
            return g
        },queryJavaHandler: function(c) {
            var b = c.java, a = window.java, d;
            b.hasRun = true;
            try {
                if (c.isDefined(a.lang) && c.isDefined(a.lang.System)) {
                    b.value = [a.lang.System.getProperty("java.version") + " ", a.lang.System.getProperty("java.vendor") + " "]
                }
            } catch (d) {
            }
        },queryJava: function() {
            var c = this, d = c.$, b = navigator.userAgent, f;
            if (d.isDefined(window.java) && navigator.javaEnabled() && !c.hasRun) {
                if (d.isGecko) {
                    if (d.hasMimeType("application/x-java-vm")) {
                        try {
                            var g = document.createElement("div"), a = document.createEvent("HTMLEvents");
                            a.initEvent("focus", false, true);
                            g.addEventListener("focus", d.handler(c.queryJavaHandler, d), false);
                            g.dispatchEvent(a)
                        } catch (f) {
                        }
                        if (!c.hasRun) {
                            c.queryJavaHandler(d)
                        }
                    }
                } else {
                    if ((/opera.9\.(0|1)/i).test(b) && (/mac/i).test(b)) {
                    } else {
                        if (!c.hasRun) {
                            c.queryJavaHandler(d)
                        }
                    }
                }
            }
            return c.value
        },forceVerifyTag: [],jar: [],VENDORS: ["Sun Microsystems Inc.", "Apple Computer, Inc."],init: function() {
            var a = this, b = a.$;
            a.hasRun = false;
            a.value = [null, null];
            a.tryApplet = [2, 2, 2];
            a.DOMobj = [0, 0, 0, 0, 0, 0];
            a.Applet0Index = 3;
            a.queryDTKresult = null;
            a.OTF = 0;
            a.BridgeResult = [[null, null], [null, null], [null, null]];
            a.JavaActive = [0, 0, 0];
            a.All_versions = [];
            a.DeployTK_versions = [];
            a.MimeType_versions = [];
            a.JavaPlugin_versions = [];
            a.funcs = [];
            var c = a.NOTF;
            if (c) {
                c.$ = b;
                if (c.javaInterval) {
                    clearInterval(c.javaInterval)
                }
                c.EventJavaReady = null;
                c.javaInterval = null;
                c.count = 0;
                c.intervalLength = 250;
                c.countMax = 33
            }
        },getVersion: function(e, j) {
            var g, d = this, f = d.$, i = vendor = versionEnabled = null, c = navigator.javaEnabled();
            if (d.getVersionDone === null) {
                d.init()
            }
            var k;
            if (f.isArray(j)) {
                for (k = 0; k < d.tryApplet.length; k++) {
                    if (typeof j[k] == "number") {
                        d.tryApplet[k] = j[k]
                    }
                }
            }
            for (k = 0; k < d.forceVerifyTag.length; k++) {
                d.tryApplet[k] = d.forceVerifyTag[k]
            }
            if (f.isString(e)) {
                d.jar[d.jar.length] = e
            }
            if (d.getVersionDone == 0) {
                if (!d.version || d.useAnyTag()) {
                    g = d.queryExternalApplet(e);
                    if (g[0]) {
                        d.installed = 1;
                        d.EndGetVersion(g[0], g[1])
                    }
                }
                return
            }
            var h = d.queryDeploymentToolKit();
            if (f.num(h)) {
                i = h;
                vendor = d.VENDORS[0]
            }
            if (!f.isIE) {
                var n, l, b, m, a;
                a = f.hasMimeType(d.mimeType);
                m = (a && c) ? true : false;
                if (d.MimeType_versions.length == 0 && a) {
                    g = d.getFromMimeType("application/x-java-applet.*jpi-version.*=");
                    if (g[0] != "") {
                        if (!i) {
                            i = g[0]
                        }
                        d.MimeType_versions = g
                    }
                }
                if (!i && a) {
                    g = "Java[^\\d]*Plug-in";
                    b = f.findNavPlugin(g);
                    if (b) {
                        g = new RegExp(g, "i");
                        n = g.test(b.description) ? f.getNum(b.description) : null;
                        l = g.test(b.name) ? f.getNum(b.name) : null;
                        if (n && l) {
                            i = (f.compareNums(f.formatNum(n), f.formatNum(l)) >= 0) ? n : l
                        } else {
                            i = n || l
                        }
                    }
                }
                if (!i && a && (/macintosh.*safari/i).test(navigator.userAgent)) {
                    b = f.findNavPlugin("Java.*\\d.*Plug-in.*Cocoa", false);
                    if (b) {
                        n = f.getNum(b.description);
                        if (n) {
                            i = n
                        }
                    }
                }
                if (i) {
                    d.version0 = i;
                    if (c) {
                        versionEnabled = i
                    }
                }
                if (!versionEnabled || d.useAnyTag()) {
                    b = d.queryExternalApplet(e);
                    if (b[0]) {
                        versionEnabled = b[0];
                        vendor = b[1]
                    }
                }
                if (!versionEnabled) {
                    b = d.queryJava();
                    if (b[0]) {
                        d.version0 = b[0];
                        versionEnabled = b[0];
                        vendor = b[1];
                        if (d.installed == -0.5) {
                            d.installed = 0.5
                        }
                    }
                }
                if (d.installed === null && !versionEnabled && m && !(/macintosh.*ppc/i).test(navigator.userAgent)) {
                    g = d.getFromMimeType("application/x-java-applet.*version.*=");
                    if (g[0] != "") {
                        versionEnabled = g[0]
                    }
                }
                if (!versionEnabled && m) {
                    if (/macintosh.*safari/i.test(navigator.userAgent)) {
                        if (d.installed === null) {
                            d.installed = 0
                        } else {
                            if (d.installed == -0.5) {
                                d.installed = 0.5
                            }
                        }
                    }
                }
            } else {
                if (!i && h != -1) {
                    i = d.searchJavaPluginAXO();
                    if (i) {
                        vendor = d.VENDORS[0]
                    }
                }
                if (!i) {
                    d.JavaFix()
                }
                if (i) {
                    d.version0 = i;
                    if (c && f.ActiveXEnabled) {
                        versionEnabled = i
                    }
                }
                if (!versionEnabled || d.useAnyTag()) {
                    g = d.queryExternalApplet(e);
                    if (g[0]) {
                        versionEnabled = g[0];
                        vendor = g[1]
                    }
                }
            }
            if (d.installed === null) {
                d.installed = versionEnabled ? 1 : (i ? -0.2 : -1)
            }
            d.EndGetVersion(versionEnabled, vendor)
        },EndGetVersion: function(b, d) {
            var a = this, c = a.$;
            if (a.version0) {
                a.version0 = c.formatNum(c.getNum(a.version0))
            }
            if (b) {
                a.version = c.formatNum(c.getNum(b));
                a.vendor = (c.isString(d) ? d : "")
            }
            if (a.getVersionDone != 1) {
                a.getVersionDone = 0
            }
        },queryDeploymentToolKit: function() {
            var d = this, g = d.$, i, b, c, h = null, a = null;
            if ((g.isGecko && g.compareNums(g.GeckoRV, g.formatNum("1.6")) <= 0) || g.isSafari || (g.isIE && !g.ActiveXEnabled)) {
                d.queryDTKresult = 0
            }
            if (d.queryDTKresult !== null) {
                return d.queryDTKresult
            }
            if (g.isIE && g.IEver >= 6) {
                d.DOMobj[0] = g.instantiate("object", [], []);
                h = g.getObject(d.DOMobj[0])
            } else {
                if (!g.isIE && (c = g.hasMimeType(d.DTKmimeType)) && c.type) {
                    d.DOMobj[0] = g.instantiate("object", ["type", c.type], []);
                    h = g.getObject(d.DOMobj[0])
                }
            }
            if (h) {
                if (g.isIE && g.IEver >= 6) {
                    try {
                        h.classid = d.DTKclassID
                    } catch (i) {
                    }
                }
                try {
                    var c, f = h.jvms;
                    if (f) {
                        a = f.getLength();
                        if (typeof a == "number") {
                            for (b = 0; b < a; b++) {
                                c = f.get(a - 1 - b);
                                if (c) {
                                    c = c.version;
                                    if (g.getNum(c)) {
                                        d.DeployTK_versions[b] = c
                                    }
                                }
                            }
                        }
                    }
                } catch (i) {
                }
            }
            d.queryDTKresult = d.DeployTK_versions.length > 0 ? d.DeployTK_versions[0] : (a == 0 ? -1 : 0);
            return d.queryDTKresult
        },queryExternalApplet: function(g) {
            var d = this, i = d.$, l = d.BridgeResult, c = d.DOMobj, k = d.Applet0Index, a = "&nbsp;&nbsp;&nbsp;&nbsp;", f = "A.class";
            if (!i.isString(g) || !(/\.jar\s*$/).test(g) || (/\\/).test(g)) {
                return [null, null]
            }
            if (d.OTF < 1) {
                d.OTF = 1
            }
            if ((i.isGecko || i.isChrome || (i.isOpera && !navigator.javaEnabled())) && !i.hasMimeType(d.mimeType) && !d.queryJava()[0]) {
                return [null, null]
            }
            if (d.OTF < 2) {
                d.OTF = 2
            }
            if (!c[1] && d.canUseObjectTag()) {
                c[1] = i.instantiate("object", [], [], a)
            }
            if (!c[2]) {
                c[2] = i.instantiate("", [], [], a)
            }
            var n = g, h = "", q;
            if ((/[\/]/).test(g)) {
                q = g.split("/");
                n = q[q.length - 1];
                q[q.length - 1] = "";
                h = q.join("/")
            }
            var e = ["archive", n, "code", f], b = ["mayscript", "true"], p = ["scriptable", "true"].concat(b);
            if (!c[k] && d.canUseObjectTag() && d.canTryApplet(0)) {
                c[k] = i.isIE ? i.instantiate("object", ["type", d.mimeType].concat(e), ["codebase", h].concat(e).concat(p), a, d) : i.instantiate("object", ["type", d.mimeType, "archive", n, "classid", "java:" + f], ["codebase", h, "archive", n].concat(p), a, d);
                l[0] = [0, 0];
                d.query1Applet(k)
            }
            if (!c[k + 1] && d.canUseAppletTag() && d.canTryApplet(1)) {
                c[k + 1] = i.isIE ? i.instantiate("applet", ["alt", a].concat(b).concat(e), ["codebase", h].concat(b), a, d) : i.instantiate("applet", ["codebase", h, "alt", a].concat(b).concat(e), [].concat(b), a, d);
                l[1] = [0, 0];
                d.query1Applet(k + 1)
            }
            if (!c[k + 2] && d.canUseObjectTag() && d.canTryApplet(2)) {
                c[k + 2] = i.isIE ? i.instantiate("object", ["classid", d.classID], ["codebase", h].concat(e).concat(p), a, d) : i.instantiate();
                l[2] = [0, 0];
                d.query1Applet(k + 2)
            }
            ;
            if (d.OTF < 3 && ((c[k] && !l[0][0]) || (c[k + 1] && !l[1][0]) || (c[k + 2] && !l[2][0]))) {
                var m = d.NOTF.isJavaActive();
                if (m >= 0) {
                    d.OTF = 3;
                    d.installed = m == 1 ? 0.5 : -0.5;
                    d.NOTF.SetupAppletQuery()
                }
            }
            ;
            var o, j = 0;
            for (o = 0; o < l.length; o++) {
                if (c[k + o] || d.canTryApplet(o)) {
                    j++
                } else {
                    break
                }
            }
            if (j == l.length) {
                d.getVersionDone = d.forceVerifyTag.length > 0 ? 0 : 1
            }
            return d.getBR()
        },canUseAppletTag: function() {
            return ((!this.$.isIE || navigator.javaEnabled()) ? true : false)
        },canUseObjectTag: function() {
            return ((!this.$.isIE || this.$.ActiveXEnabled) ? true : false)
        },useAnyTag: function() {
            var b = this, a;
            for (a = 0; a < b.tryApplet.length; a++) {
                if (b.canTryApplet(a)) {
                    return true
                }
            }
            return false
        },canTryApplet: function(c) {
            var a = this, b = a.$;
            if (a.tryApplet[c] == 3) {
                return true
            }
            if (!a.version0 || !navigator.javaEnabled() || (b.isIE && !b.ActiveXEnabled)) {
                if (a.tryApplet[c] == 2) {
                    return true
                }
                if (a.tryApplet[c] == 1 && !a.getBR()[0]) {
                    return true
                }
            }
            return false
        },getBR: function() {
            var b = this.BridgeResult, a;
            for (a = 0; a < b.length; a++) {
                if (b[a][0]) {
                    return [b[a][0], b[a][1]]
                }
            }
            return [b[0][0], b[0][1]]
        },query1Applet: function(g) {
            var f, c = this, d = c.$, a = vendor = null, b = d.getObject(c.DOMobj[g], true);
            if (b) {
                try {
                    a = b.getVersion() + " ";
                    vendor = b.getVendor() + " ";
                    b.statusbar(d.winLoaded ? " " : " ")
                } catch (f) {
                }
                if (d.num(a)) {
                    c.BridgeResult[g - c.Applet0Index] = [a, vendor]
                }
                try {
                    if (d.isIE && a && b.readyState != 4) {
                        d.garbage = true;
                        b.parentNode.removeChild(b)
                    }
                } catch (f) {
                }
            }
        },NOTF: {isJavaActive: function() {
                var e = this, c = e.$.java, a, b, d = -9;
                for (a = c.Applet0Index; a < c.DOMobj.length; a++) {
                    b = e.isJavaActive_x_(a);
                    if (b == 1) {
                        c.JavaActive[a - c.Applet0Index] = 1
                    }
                    if (b > d) {
                        d = b
                    }
                }
                return d
            },isJavaActive_x_: function(g) {
                var h = this, d = h.$, c = d.java, f, b = d.getObject(c.DOMobj[g]), a = h.status(g);
                if (a == -2) {
                    return -2
                }
                if (h.status(1) >= 0) {
                    return 0
                }
                try {
                    if (d.isIE && d.IEver >= c.minIEver && b.object) {
                        return 1
                    }
                } catch (f) {
                }
                if (a == 1 && (d.isIE || c.version0)) {
                    return 1
                }
                if (a < 0) {
                    return -1
                }
                return 0
            },status: function(c) {
                var f = this, d = f.$, b = d.java, h, a = d.getObject(b.DOMobj[c]), j = d.getContainer(b.DOMobj[c]), k = f.getObjectWidth(j), g = d.getContainer(b.DOMobj[2]), i = f.getObjectWidth(g);
                if (!a || !j) {
                    return -2
                }
                try {
                    if (k >= 0 && i >= 0) {
                        if (k == i && k > d.pluginSize) {
                            return -1
                        }
                        if (k != i && k == d.pluginSize && d.winLoaded && (!d.isIE || a.readyState == 4)) {
                            return 1
                        }
                    }
                } catch (h) {
                }
                return 0
            },getObjectWidth: function(b) {
                if (b) {
                    var a = b.scrollWidth || b.offsetWidth;
                    if (typeof a == "number") {
                        return a
                    }
                }
                return -1
            },SetupAppletQuery: function() {
                var b = this, a = b.$;
                if (b.EventJavaReady !== true) {
                    b.EventJavaReady = true;
                    b.onIntervalQuery = b.$$onIntervalQuery(b);
                    if (a.isDefined(setInterval)) {
                        b.javaInterval = setInterval(b.onIntervalQuery, b.intervalLength)
                    }
                    if (!a.winLoaded) {
                        a.WLfuncs[0] = b.winOnLoadQuery
                    }
                }
            },winOnLoadQuery: function(c) {
                var b = c.java, d = b.NOTF, a;
                if (b.OTF == 3) {
                    a = d.AppletQuery();
                    d.queryCleanup(a[1], a[2])
                }
            },$$onIntervalQuery: function(a) {
                return function() {
                    var d = a.$, c = d.java, b;
                    if (c.OTF == 3) {
                        b = a.AppletQuery();
                        if (b[0] || (d.winLoaded && a.count > a.countMax)) {
                            a.queryCleanup(b[1], b[2])
                        }
                    }
                    a.count++
                }
            },AppletQuery: function() {
                var f = this, e = f.$, d = e.java, b, a, c;
                for (b = 0; b < d.BridgeResult.length; b++) {
                    d.query1Applet(b + d.Applet0Index)
                }
                a = d.getBR();
                c = (a[0] || f.isJavaActive() < 0) ? true : false;
                return [c, a[0], a[1]]
            },queryCleanup: function(d, g) {
                var f = this, e = f.$, c = e.java, a;
                if (c.OTF == 4) {
                    return
                }
                c.OTF = 4;
                var b = f.isJavaActive() == 1 ? true : false;
                if (d) {
                    c.installed = 1
                } else {
                    if (b) {
                        if (c.version0) {
                            c.installed = 1;
                            d = c.version0
                        } else {
                            c.installed = 0
                        }
                    } else {
                        if (c.installed == 0.5) {
                            c.installed = 0
                        } else {
                            if (c.version0) {
                                c.installed = -0.2
                            } else {
                                c.installed = -1
                            }
                        }
                    }
                }
                c.EndGetVersion(d, g);
                if (f.javaInterval) {
                    clearInterval(f.javaInterval)
                }
                e.callArray(c.funcs);
                if (e.onDoneEmptyDiv) {
                    e.onDoneEmptyDiv()
                }
            }},append: function(e, d) {
            for (var c = 0; c < d.length; c++) {
                e[e.length] = d[c]
            }
        },JavaFix: function() {
        }},zz: 0};
PluginDetect.initScript();
