/// <reference path="jquery-latest.js" />
;"undefined"===typeof SF&&(SF={});"undefined"===typeof SF.Localization&&(SF.Localization={});
("undefined" === typeof console || "undefined" === typeof console.log) && (console = { log: function () { } });

/* Add Support for JSON.stringify for IE */
{function goog(a){var b=typeof a;if(b=="object")if(a){if(a instanceof Array)return"array";else if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if(c=="[object Window]")return"object";if(c=="[object Array]"||typeof a.length=="number"&&typeof a.splice!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("splice"))return"array";if(c=="[object Function]"||typeof a.call!="undefined"&&typeof a.propertyIsEnumerable!="undefined"&&!a.propertyIsEnumerable("call"))return"function"}else return"null"; else if(b=="function"&&typeof a.call=="undefined")return"object";return b};function gh(a){var a=String(a),b;b=/^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""));if(b)try{return eval("("+a+")")}catch(c){}throw Error("Invalid JSON string: "+a);}function gi(a){var b=[];jfun(new k,a,b);return b.join("")}function k(){} function jfun(a,b,c){switch(typeof b){case "string":gl(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(b==null){c.push("null");break}if(goog(b)=="array"){var f=b.length;c.push("[");for(var d="",e=0;e<f;e++)c.push(d),jfun(a,b[e],c),d=",";c.push("]");break}c.push("{");f="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(e=b[d],typeof e!="function"&&(c.push(f),gl(d,c),c.push(":"),jfun(a,e,c),f=",")); c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var m={'"':'\\"',"\\":"\\\\","/":"\\/","\u0008":"\\b","\u000c":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\u000b":"\\u000b"},n=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;function gl(a,b){a=a.replace(/\\/i,'\\\\');b.push('"',a.replace(n,function(a){if(a in m)return m[a];var b=a.charCodeAt(0),d="\\u";b<16?d+="000":b<256?d+="00":b<4096&&(d+="0");return m[a]=d+b.toString(16)}),'"')};window.JSON||(window.JSON={});typeof window.JSON.stringify!=="function"&&(window.JSON.stringify=gi);typeof window.JSON.parse!=="function"&&(window.JSON.parse=gh);}
// Set up localization
String.toLocaleString({
    "en-US": {
        "%Cancel": "Cancel",
        "%Error": "%Error",
        "%IfErrorPersists": "If this error persists, try reloading this page.",
        "%OK":"OK",
        "%ProblemProcessingCmd": "There was a problem processing your request. If this error persists, try reloading this page."
    }
});
var l = function (string) { return string.toLocaleString(); },
    lr = function (string, rep) { return string.localeReplace(rep); };

var resizeRequested = false,
    hasLearn = true,
    tSpan = false,
    AppCb = false,
    isIE = $.browser.msie,
    isFF = $.browser.mozilla,
    isLegacyFF = isFF && parseFloat($.browser.version) < 7,
    isLegacyBrowser = isIE && parseFloat($.browser.version) < 7,
    isMobile = $.browser.webkit && (navigator.userAgent.match(/like Mac OS X/i) != null || navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/Mobile Safari/i)) || navigator.userAgent.match(/Opera M/i) || navigator.userAgent.match(/Fennec/i) || navigator.userAgent.match(/Silk\//i),
    currWidth = false,
    isLocked = null,
    mHeight = false,
    outerWrap = false,
    hasFocus = true,
    dropPosX = null, //  Dropper position cache for folder.js, needs to be declared here so it can be zeroed out easily
    enableEscapeClose = true, /** Whether the excape key can be used to close a modal **/
    checkedCount = 0;

function pageCtrlInit()
{
    var $bar = $('#query'); if(!$bar){ $bar = $('.SearchBar:first'); }
    
    $bar.focus(function(){
        $bar.removeClass('watermark');
        if($bar.val() == $bar.attr('data-default')){ $bar.val(""); }
    }).blur(function(){
        if($bar.val() == $bar.attr('data-default') || $bar.val() == "" ){
            $bar.addClass('watermark').val($bar.attr('data-default'));
        }
    });
    
    if(hasFocus){
        var input = $('input.giveFocus,textarea.giveFocus');
        if(input.length > 0 && input.is(':visible'))
        {
            focusToEnd(input);
        }
    }

    $('#slidegrip, #pinCtrl').click(function () {
        return toggleSlideWindow(this.id == 'pinCtrl');
    });

    $('body').delegate('input.checkAllTable', 'click', function () {
        var $this = $(this),
            isChecked = $this.prop('checked') == true,
            parentSel = $this.attr('data-parent'),
            doCount = $this.attr('data-count') == "true",
            $table;
        if (parentSel && parentSel.length > 0) {
            // If we've been given an ID, don't walk up the dom
            $table = parentSel[0] == '#' ? $(parentSel) : $this.closest(parentSel);
        }
        else { $table = $this.closest('table'); }

        var chkbxFilter = $this.attr('onCheckAll') || '';
        if (chkbxFilter.length > 0) {
            chkbxFilter = '.' + chkbxFilter;
        }
        if ($table.length > 1) { $table = $table[$table.length - 1]; }

        var c = $table.find('input:checkbox:enabled:not(.checkAllTable)' + chkbxFilter).prop('checked', isChecked).length;
        if (!isChecked) {
            c = 0;
        }
        if (doCount) { checkedCount = c; }

        $('body').trigger('checkall', [isChecked, parentSel, c]);
    });
    
    sortables_jq('body');

    if(hasLearn){
        $.tooltip.addSel('.sdtooltip, .icoLearnMore, a.learnMoreHeader, a.learnMore, span.learnMoreHeader', {
            bodyHandler: function() {
                if(this.tooltipText) { return null; }
                var $elem = $(this);
                var body = $elem.attr("body");
                if(typeof(body) == 'string'){ return body; }
                else{ return $($elem.attr("href")).html(); }
                }, 
            showURL: false,
            delay: 0,
            extraClass: "learnTip"
        });
    }

    $(document).keydown(function (event) {
        if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
            if (event.target.tagName.toLowerCase() != 'textarea' && typeof defaultBtnID !== 'undefined' && defaultBtnID &&
                (typeof this.className === 'undefined' || this.className.indexOf('skipDefault') == -1) && (typeof Page_ClientValidate === 'undefined' || Page_ClientValidate())) {
                var autoCom = $('.ac_results');
                if (autoCom.length == 0 || !autoCom.is(':visible')) {
                    $('#' + defaultBtnID).click();
                    if (typeof defaultBtnUID !== 'undefined' && defaultBtnUID) {
                        __doPostBack(defaultBtnUID, '');
                    }
                    return false;
                }
            }
        }
    });

    // Attach common operation buttons
	$('body').delegate('.commonOp', 'click', function(ev){
		if(this.getAttribute("data-command") != null)
		{
			return commonOp(this, this.getAttribute("data-command"), this.getAttribute("data-arg"), this.getAttribute("data-call"), ev);
		}
	});

	$('#innerBody').delegate('input:checkbox.rememberpref', 'click', function () {
		// check input ($(this).val()) for validity here
		if ($(this).attr('disabled') == 'disabled') return;

		var prefname = $(this).attr('prefName');
		if (prefname != 'None') {
			var selected = $(this).prop('checked') == true;
			setPreference('adduser_' + prefname, selected.toString());
		}
	});
}

var commonOpHooks = [],

commonOp = function (elem, command, arg, callback) {
    hookFinished = false;
    if (commonOpHooks.length) {
        for (var i = 0; i < commonOpHooks.length; i++) {
            var ret = commonOpHooks[i](elem, command, arg, callback)
            // If ret is undefined, keep looping through to see if any other hooks are interested in this command
            if(ret !== undefined) { return ret; }
        }
    }
    return defaultOps(elem, command, arg, callback)
},
hookAdd = function(opFunc){
	commonOpHooks.push(opFunc);
	return opFunc;
},
	
hookRemove = function(opFunc){
	var i = commonOpHooks.indexOf(opFunc);
  	if(i != -1){ commonOpHooks.splice(i, 1); }
	return opFunc;
},
	
hookClear = function(){
	commonOpHooks = [];
};

defaultOps = function (elem, command, arg, callback) {
    switch (command) {
        case "list-collapse":
            if (arg) {
                var $elem = $(elem),
                    isClosed = $elem.hasClass('menu-list-closed');
                if ($elem.hasClass('remember')) {
                    var newSetting = isClosed ? 'open' : 'closed';
                    setKeyedPreference("menu-list", arg, newSetting);
                }
                $elem.toggleClass('menu-list-closed');

                if (isClosed) {
                    $(arg).slideDown('fast');
                }
                else $(arg).slideUp('fast');
            }
            break;
    }
    return false;
}

function setupRounded(elem) {
    do {
        $(elem + ':not(.processed)').each(function() {
            $(this).addClass('processed').html('<div class="r-corner r-ur"><div class="r-corner r-ul"><div class="r-corner r-br"><div class="r-corner r-bl">' + $(this).html() + '</div></div></div></div>');
        });
    }
    while($(elem + ':not(.processed)').length > 0);
}
 
function toggleSlideWindow(togglePin) {
    if(togglePin){
        $('body').toggleClass('tree-auto').toggleClass('tree-pinned');
        $('html').toggleClass('tree-pinned');
        $('.slide-window').css('left', '');
        if (isLegacyFF) { reflowTruncated(); }
        if(dropPosX) dropPosX = null; // Folder.js dropper position must be reset
        
        // Save for cross page usage, if this setting has changed
        var isPinned = $('body').hasClass('tree-pinned');
        if(isPinned) { setKeyedPreference('tree-pinned', SF.user.id, 'True'); }
        else { setKeyedPreference('tree-pinned', SF.user.id, 'False'); }
        
        $.ajax({
          cache: false,
          type: "POST",
          url: "/webservices/AjaxUtils.asmx/TreeViewPin",
          data: "{'IsPinned': " + isPinned + "}",
          contentType: "application/json; charset=utf-8",
          dataType: "json"
        });
    }
    else{
        if($('body').hasClass('tree-open'))
        {
            $('.slide-window').animate({'left': '-217px'}, 500, 'easeOutBack');
        }
        else{ $('.slide-window').animate({'left': '0px'}, 500, 'easeInBack'); }
        
        $('body').toggleClass('tree-open');
    }
    
    return false;
}

function focusToEnd(input) {
    var jqElem = input.eq(0), elem = jqElem[0], pos = jqElem.val().length;
    if (elem.createTextRange) {
        if (jqElem.is(':visible')) { 
            var range = elem.createTextRange();
            range.move('character', pos);
            elem.focus();
            range.select();
            document.getElementById('outer-outer').scrollTop = 0; // Otherwise IE6/7 will try to scroll to the focused elem
        }
    }
    else {  jqElem.focus(); }
}

function buttonSetup(parent) {
    // Set up buttons and dropdowns
    $('#innerBody').delegate('a.btn-ui, span.btn-drp a', 'click', function (e) {
        var elem = $(this);
        if (elem.hasClass('btn-disabled') || elem.attr('disabled') == 'disabled') { return false; }
        if (elem.hasClass('lock')) { elem.addClass('btn-disabled'); }
        else { window.setTimeout(function () { clearProcessingMessages(false); }, 1600); }

        if (!elem.hasClass('noproc')) {
            if (elem.hasClass('btn-ui')) { elem.addClass('active'); }
            else { elem.closest('.btn-drp').addClass('active'); }
        }
        return true;
    });
        }

function setupEmailValidation(){
    $('input.validateemailaddress, a.validateemailaddress').each(function(index){
        bindEmailValidation($(this), index);
    });
}

function bindEmailValidation(btn, idx)
{
    btn.click(function(event){
        var email = $('input.emailaddress').eq(idx).val();

        if (!validateSingleEmailAddress(email))
        {
            $('input.emailaddress').eq(idx).addClass('error');
            event.stopImmediatePropagation();
            return false;
        }
    });
}

function clearProcessingMessages(unlock)
{
    if(unlock) $('.btn-ui.active, span.btn-ui.active a').removeClass('btn-disabled').removeClass('active');
    else $('.btn-ui.active:not(.lock)').removeClass('active');
}

function setupWinSize(firstRun) {
      var  size = $(window).width(),
           newClass = 'width-xs',
           $body = $(document.body),
           hasNewClass = false;

      if(size >= 1436) newClass = 'width-hd';
      else if(size >= 1210) newClass = 'width-md';
      else if(size >= 945) newClass = 'width-sd';
      
      if(isLocked == null) isLocked = $body.hasClass('lock-width');
      
      if(currWidth) hasNewClass = newClass != currWidth;
      else hasNewClass = document.body.className.indexOf(newClass) == -1;
      
      currWidth = newClass;
      
      if(hasNewClass)
      {
        if(dropPosX) dropPosX = null; // Folder.js dropper position must be reset
        setPreference('AppWidth', newClass);
        var newBClasses = document.body.className.replace('width-sd','').replace('width-md','').replace('width-hd','').replace('width-xs','').trim() + ' ' + newClass;
        if(!isLocked){ document.body.className = newBClasses; }
      }

    if (firstRun !== true && hasNewClass && !isLocked && isLegacyFF) reflowTruncated();
      
      
      window.setTimeout(function(){resizeRequested = false;}, 200);
      
      if (isLegacyBrowser)
      {
        fixWindowIE6();
      }
}	

jQuery.easing['jswing'] = jQuery.easing['swing'];
jQuery.extend( jQuery.easing,
{
    easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
    easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}
});

// Friendly text truncation is opposite land. IE supports this in CSS but FF needs help
function reflowTruncated(){
      $('table.trunc').each(function() {
        var $table = $(this);
        $('th.trunc', $table).each(function() {
            var pos = $(this).index() + 1,
                css = $(this).attr('truncCss'),
                children = $table.find('td:nth-child(' + pos + ')'),
                truncCall = truncateByWidth;
            if(children.length > 1000) return;
            
            if(!css) css = false;
            
            // Send in max height, so we know if we even need to bother
            var maxline = parseInt(children.eq(0).css('line-height')) + parseInt(children.eq(0).css('padding-top')) + parseInt(children.eq(0).css('padding-bottom'));

            children.each(function(){truncCall(this, css, maxline)});
         });   
      });
}

function truncateByWidth(obj, css, height)
{   
    var $obj = $(obj),
        $elem = $(obj).children(':first'),
        truncStr = "",
        altSort = $elem.attr('altSort');
    var elemH = $elem.height();
    
    
    if(altSort !== undefined)
    {
        // If the element already has an altSort value, and that value is longer than the elem's HTML, we need to recheck it for truncation
        if(altSort.length > $elem.val().length)
        {
            truncStr = fitStringToWidth(altSort, $obj.width(), css);
            if(truncStr != null){ $elem.html(truncStr); }
            else{ $elem.html(altSort); }
        }
    }
    else if(height && $elem.length > 0 && height >= $elem.height()) { return; }// If the element fits in the max height, it's not too long
    else if($elem.length > 0)
    {
        truncStr = fitStringToWidth($elem.html(), $obj.width(), css);
        if(truncStr != null) { $elem.attr('altSort', $elem.html()).html(truncStr); }
    }
    else
    {
        truncStr = fitStringToWidth($obj.html(), $obj.width(), css);
        if(truncStr != null) { $obj.html('<span altSort="' + $obj.html() + '">' + truncStr + '</span>'); }
    }
}

String.prototype.replaceAll = function (match, replace) {
    var regex = new RegExp(match, 'g')
    return this.replace(regex, replace);
}

function fitStringToWidth(str,width,className) {
  // str    A string where html-entities are allowed but no tags.
  // width  The maximum allowed width in pixels
  // className  A CSS class name with the desired font-name and font-size. (optional)
  // ----
  // _escTag is a helper to escape 'less than' and 'greater than'
  function _escTag(s){ return s.replace(/</g,"&lt;").replace(/>/g,"&gt;");}

  //Create a span element that will be used to get the width
  if(!tSpan) { createTestSpan(); }
  var span = tSpan;
  //Allow a classname to be set to get the right font-size.
  if (className) span.className=className;
  span.style.display='inline';

  var result = null; // default to the whole string
  span.innerHTML = _escTag(str);
  // Check if the string will fit in the allowed width. NOTE: if the width
  // can't be determinated (offsetWidth==0) the whole string will be returned.
  if (span.offsetWidth > width) {
    var posStart = 0, posMid, posEnd = str.length, posLength;
    // Calculate (posEnd - posStart) integer division by 2 and
    // assign it to posLength. Repeat until posLength is zero.
    while (posLength = (posEnd - posStart) >> 1) {
      posMid = posStart + posLength;
      //Get the string from the begining up to posMid;
      span.innerHTML = _escTag(str.substring(0,posMid)) + '&hellip;';

      // Check if the current width is too wide (set new end)
      // or too narrow (set new start)
      if ( span.offsetWidth > width ) posEnd = posMid; else posStart=posMid;
    }
    if(posStart > 5) posStart -= 1;
    result = _escTag(str.substring(0,posStart)) +
      '&hellip;';
  }
  span.style.display='none';
  return result;
}

function createTestSpan()
{
    tSpan = document.createElement("span");
    tSpan.style.visibility = 'hidden';
    tSpan.style.padding = '0px';
    document.body.appendChild(tSpan);
}

function ClearJavascript()
{
    if(parent && parent.mastheadframe) parent.mastheadframe.window.location.href = 'blank.aspx';
}

function runOnceJS()
{
    $.ajax({
      cache: false,
      type: "POST",
      url: "/webservices/AjaxUtils.asmx/GetRunOnceJS",
      data: null,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(result) { $(document).ready(function(){parseAjaxResult(result, null, true);}); }
    });
    return false;

}

function parseAjaxResult(result, elem, skipClear){
    // Parse messages
    if(result == null) { return; }
    result.allowClick = false;
    
    if(result.MessageType == "message"){
        displayMessage(result.Message.Subject, result.Message.Body, result.Message.Type, result.Message.TimeOut );
    }
    else if(result.MessageType == "js"){
        eval(result.Message);
    }
    else if(result.MessageType == "html"){
        $('#modal #modalContent').html(result.Message);   
    }
    else if(result.ResultType == "redirect"){
        window.location = result.Result;
    }
    else if(result.ResultType == "clickHREF")
    {
        if(elem) $(elem).attr('href', result.Result);
        result.allowClick = true;
    }
    if(!skipClear) clearProcessingMessages(true);
    return result.Result;
}

/* Legacy Global Code */

// Detect browser (see http://www.quirksmode.org/js/detect.html)
function checkIt(s)
{
	return navigator.userAgent.toLowerCase().indexOf(s) + 1;
}

// Open a url in a new window
function openWindow(url,width,height,scrollbars) 
{
	var leftoffset = (screen.width - width - 10)/2;
	var topoffset = (screen.height - width - 40)/2;
	return window.open(url,'_blank','titlebar=no,resizable=no,scrollbars=' + scrollbars + ',width=' + width + ',height=' + height + ',left=' + leftoffset + ',top=' + topoffset);
}

// Cross-browser code to get element position
function getElementY(e)
{
  if (!(e=xGetElementById(e))) return 0;
  var y = 0;
  while (e) {
    if (xDef(e.offsetTop)) y += e.offsetTop;
    e = xDef(e.offsetParent) ? e.offsetParent : null;
  }
  return y;
}
function getElementX(e)
{
  if (!(e=xGetElementById(e))) return 0;
  var x = 0;
  while (e) {
    if (xDef(e.offsetLeft)) x += e.offsetLeft;
    e = xDef(e.offsetParent) ? e.offsetParent : null;
  }
  return x;
}
function xDef()
{
  for(var i=0; i<arguments.length; ++i){if(typeof(arguments[i])=='undefined') return false;}
  return true;
}
function xGetElementById(e)
{
  if(typeof(e)!='string') return e;
  if(document.getElementById) e=document.getElementById(e);
  else if(document.all) e=document.all[e];
  else e=null;
  return e;
}

// Show custom popup
function showMessagePopup(obj, type, message)
{
    displayMessage(type, message, type);
    return;
}

function displayMessage(subject, body, type, timeout)
{
    jAlert(body, subject, type);
}

// Show custom remote popup
function displayMessageRemote(subject, url, type)
{
    $.get(url, function(data){
        jAlert(data, subject, type);
       return false;
     });
    return false;
}

// Deprecated: show custom remote popup
function showRemotePopup(obj, type, url)
{
    return displayMessageRemote(type, url, 'noIcon');
}

// Show custom remote popup
function showCustomRemotePopup(obj, title, url, width)
{
    $.fn.colorbox({href: url, title: title, iframe: false, rel: 'nofollow', opacity: 0, height: false, maxWidth: "90%", maxHeight: "90%", innerWidth: width  });
}

// Show custom remote popup
function showPreview(type, args)
{
	var url = '',
	customMessage = $('.CustomMessage').val(),
	requireLogin = '';
	
	if(!customMessage) customMessage = '';
    var req = $('input.RequireLogin, .RequireLogin input');
	if (req.length > 0) requireLogin = '&requirelogin=' + req.prop('checked');
	if (!args) args = '';
	url = 'preview.aspx?type=' + type;
	
    showPreviewMsg(url, requireLogin + args, customMessage);
}

function showPreviewMsg(prevLink, args, msg)
{
	if (!args) args = '';
	url = prevLink + args;
	
	$.post(url, { message: msg },
	    function(data){
	     var res = $('#prevResult');
	     if(res.length == 0) res = $('<div class="hidden" id="prevResult"><div id="prevInner" class="infotip-clear" ></div></div>').appendTo('body');
	     $('#prevInner').html(data);
         $.fn.colorbox({inline: true, href: '#prevInner', title: "<span class='ico16 icoSearchSM'></span>Preview", rel: 'nofollow', opacity: 0, maxWidth: "90%", maxHeight: "90%", initialHeight: "240" });
       });
}

function showPreviewFullURL(url)
{ 
	$.fn.colorbox({href: url, title: "<span class='ico16 icoSearchSM'></span>Preview", iframe: true, rel: 'nofollow', opacity: 0, innerHeight: "500", innerWidth: "575", maxWidth: "90%", maxHeight: "90%" });
}

// Hide custom popup
function hidePopup()
{
    showAllDropDowns();
    
	document.getElementById('popuptitle').innerHTML = '';
	document.getElementById('popupcontent').innerHTML = '<div align="center">loading...</div>';
	document.getElementById('popup').style.display = 'none';
}

//Use ajax to load content into this window
function loadRemoteContent(url, id) 
{
  var requestURL = escape(url);
  if (document.getElementById) var x = (window.ActiveXObject) ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
  if (x) 
  {
    x.onreadystatechange = function() 
    {
      if (x.readyState == 4 && x.status == 200) 
      {
        el = document.getElementById(id);
        el.innerHTML = x.responseText;
      }
    }
    x.open('GET', url, true);
    x.send(null);
  }
}

//Extend javascript string to support trim method
if (!String.prototype.trim) {
    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/, ''); };
}

//Validates a comma-separated or semicolon separated list of e-mail addresses
function validateMultipleEmailAddresses(input)
{
    var emailList = '';

    if (input.indexOf(';') > -1) 
    {
	    emailList = input.split(';');
    }
    else emailList = input.split(',');

    var invalidEmailList = new Array();

    if (emailList.length > 100)
    {
	    displayMessage('Email Validation Error','To prevent spam, you cannot send to more than 100 recipients at a time.', 'warning');
	    return false;
    }

    if (emailList.length > 0)
    {
	    for(var i = 0; i < emailList.length; i++)
	    {
		    var emailAddress = emailList[i].toString().trim();
		    var isValid = validateSingleEmailAddress(emailAddress);
		    if (!isValid) invalidEmailList.push(emailAddress);
	    }
    	
	    if (invalidEmailList.length == 0) return true;
	    else
	    {
		    //Build a string with the invalid e-mail list
		    var errorMsg = 'The below e-mail addresses are invalid. Please correct these e-mail address and try again: \n';
    		
    		if(invalidEmailList.length > 0){
    		    errorMsg += '<ul class="error-list">';
		        for (var i = 0; i < invalidEmailList.length; i++)
		        { errorMsg += '<li>"' + invalidEmailList[i].toString() + '"</li>'; }
		        errorMsg += '</ul>';
		    }
    		
		    //Show an alert
		    displayMessage('Email Validation Error', errorMsg, 'errorIcon');
    		
		    return false;
	    }
    }
    else return false;
    }

//Validates a single e-mail address
function validateSingleEmailAddress(input)
{
	if (input.length == 0) return false;
	
	var filter  = /^([a-zA-Z0-9_'~\\\/\.\-\+\&])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	if (filter.test(input)) return true;
	else return false;
}

//Truncates a string to the maxLength, ignoring spaces and hyphens
function truncateString(input)
{
	return truncateStringForFileName(input);
}

function truncateStringForFileName(input)
{
	//var maxLength = 20;
	var maxLength = 100;
	
	if (input.length <= maxLength) return input;
	
	//Get the file extension from the input
	var fileExtension = '';
	if (input.lastIndexOf('.') > -1)
	{
		var lastDotIndex = input.lastIndexOf('.');
		fileExtension = input.substring(lastDotIndex, input.length);
		input = input.substring(0, lastDotIndex);
		maxLength = maxLength - fileExtension.length;
	}

	var truncated = '';
	var counter = 0;	
	
	for (var i = 0; i < input.length; i++)
	{
		//Get the current character
		var currentCharacter = input.substring(i,i+1);

		//Check to see if it's an exception character
		if (currentCharacter != ' ') counter = counter + 1;
		else counter = 0;

		if (counter <= maxLength) truncated = truncated + currentCharacter;
	}
	
	truncated = truncated + fileExtension;

	return truncated;
}

//Preference management
function getPreference(name, key)
{
    return readCookie(name, key);
}

function setPreference(name, value) {
    setKeyedPreference(name, null, value);
}
function setKeyedPreference(name, key, value)
{    
    //Format the value
    value = value.replace(/\r\n/g, '{linebreak}');
    value = value.replace(/&/g, '{amp}');

    if (value.length < 2000) //Don't allow really long cookies, since they have a max size
    {
        //Try to write a permanent cookie (approx 10 years)
        createCookie(name, key, value, 3650);
        
        //Check to see if that worked
        var retVal = readCookie(name, key);
        
        if (retVal != value)
        {
            //If not, write a Session cookie
            createSessionCookie(name, key, value);
        }
    }
}

function clearPreference(name, key)
{
    eraseCookie(name, key);
}

//Cookie management
function createSessionCookie(name, key, value) {
    createCookie(name, key, value, 0);
}
function createCookie(name, key, value, days) {
    var date = null;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    }
    createCookieWithExp(name, key, value, date);
}

function createCookieWithExp(name, key, value, expDate) {
    var cVal = value,
        expires = expDate ? "; expires=" + expDate.toGMTString() : "";

    if (key != null) {
        cVal = '';
        key = key == "" ? "_" : key;
        var keys = readCookie(name, true),
            keyFound = false;
        if (keys.length) {
            for (var i = 0; i < keys.length; i++) {
                if (keys[i]) {
                    if (keys[i].indexOf(key + "=") == 0) {
                        keyFound = true;
                        keys[i] = key + "=" + value;
                    }
                    cVal += keys[i] + '&';
                }
            }
        }
        if (!keyFound) { cVal += key + "=" + value + '&'; }
        cVal = cVal.slice(0, cVal.length - 1);
    }
    var isSecure = ("https:" == document.location.protocol) ? '; secure' : '';
    document.cookie = name + "=" + cVal + expires + isSecure + "; path=/";
}

function readCookie(name, key) {
    var keys = null,
        nameEQ = name + "=",
        ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
            keys = c.substring(nameEQ.length, c.length);
            break;
        }
    }
    if (key != null) {
        var keyArr = keys ? keys.split('&') : [];
        if (key === true) {
            return keyArr;
        }
        else if (keys != null && keys.indexOf(key) != -1) {
            for (var i = 0; i < keyArr.length; i++) {
                var k = keyArr[i];
                if (k.indexOf(key + "=") == 0) {
                    var val = k.split('=');
                    return val[1] != null ? val[1] : null;
                }
            }
        }
    }
    return keys;
}

function eraseCookie(name, key) {
    createCookie(name, key, "", -1);
}

//Flash detection
var MM_contentVersion = 8;
var plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) ? navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;
if (plugin) 
{
	var words = navigator.plugins["Shockwave Flash"].description.split(" ");
	for (var i = 0; i < words.length; ++i)
	{
		if (isNaN(parseInt(words[i]))) continue;
		var MM_PluginVersion = words[i]; 
	}
	var MM_FlashCanPlay = MM_PluginVersion >= MM_contentVersion;
}
else if (navigator.userAgent && navigator.userAgent.indexOf("MSIE")>=0 && (navigator.appVersion.indexOf("Win") != -1)) 
{
	document.write('<scr' + 'ipt language=VBScript\> \n'); //FS hide this from IE4.5 Mac by splitting the tag
	document.write('on error resume next \n');
	document.write('MM_FlashCanPlay = ( IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash." & MM_contentVersion)))\n');
	document.write('</scr' + 'ipt\> \n');
}

function encodeHtml(input)
{
    return $('<div/>').text(input).html();
}

/* Colorbox Popups */
function MainPopup(){
    if(!AppCb) AppCb = new AppCBox();
    return AppCb;
}

function AppCBox(){
    this.cbox;
    if(parent && parent.$ && parent.$.fn.colorbox){
        this.cbox = parent.$.fn.colorbox;
        }
    else this.cbox = $.fn.colorbox;
    if(this.cbox.closeType == undefined) this.cbox.closeType = false;
    if(this.cbox.closeData == undefined) this.cbox.closeData = false;
    if(this.cbox.parentValid == undefined) this.cbox.parentValid = true;
}

AppCBox.prototype = {
    resize: function(w,h) {
        // Check to see if we're in an iframe!
        var isFrame = parent.document != document && parent.$;
        if(isFrame)
        {
            // Preload any images for more accurate sizing
            $("img").each(function(idx, elm) {
                $("<img>").attr("src", elm.src);
            });

            // get doc width/height (add a bit extra for non ie)
            var iOffSet = ($.browser.msie) ? 0 : 8;

            var mW = $('body').width();
            if(mW == null || mW == 40) mW = $(document).width();

            w = w ? w : mW;
            h = h ? h : $(document.body).outerHeight() + 10; // + iOffSet;
        }
        
        // adjust size
        //alert('Width: ' + iW + ' Height: ' + iH);
        if(isFrame || w || h){
            this.cbox.resizeTo(w, h);
        }
        else this.cbox.resize();
    },
    close: function(isClean) {
        if(isClean) this.cbox.closeConfirmation(false);
        this.cbox.close();
        return false;
        },
    title: function (content) {
        this.cbox.title(content);
        },
    parentValid: function(valid) {
        if(valid != undefined) this.cbox.parentValid = valid;
        return this.cbox.parentValid;
        },
    closeConf: function(isEnabled, settings) {
        this.cbox.closeConfirmation(isEnabled, settings);
    },
    onClose: function(action, data) {
        this.cbox.closeType = action;
        this.cbox.closeData = data;
    },
    onCloseAction: function (elem) {
        try
        {
            var data = this.cbox.closeData;
            switch(this.cbox.closeType){
                case 'reload':
                    loadPage();
                    break;
                case 'redirect':
                    loadPage(data);
                    break;
                case 'callback':
                    eval('window.' + data);
                    break;
                case 'log':
                    if(console && console.log) console.log(data);
                    else alert(data);
                default:
                    if(!this.cbox.parentValid) 
                    {
                        this.cbox.parentValid = true;
                        location.href = location;
                    }
                    break;
            }
            clearProcessingMessages(false);
            this.cbox.closeData = false;
            this.cbox.closeType = false;
        }
        catch(e)
        {
            if(console && console.log) console.log(e);
        }
    }
}
    
function SetupPopup(sel, title, width, height, isFrame, onClose, onOpen, openNow){
    if(width == "s") width = "480";
    else if(width == "m") width = "670";
    else if(width == "l") width = "810";

    if(onClose == null) onClose = false;
    if (!onOpen) onOpen = clearProcessingMessages;

    if(isFrame == 'elem' || isFrame == true) { onClose = function(){ MainPopup().onCloseAction(); } }
    else if(isFrame == null){ isFrame = false; }
    if(isFrame == 'elem') isFrame = function(){ return $(this).hasClass('isFrame'); };
    
    $(sel).colorbox({ open: openNow, title: title, fastIframe: false, iframe: isFrame, rel: 'nofollow', opacity: .4, height: height, maxWidth: "97%", maxHeight: "97%", innerWidth: width, onComplete: onOpen, onClosed: onClose });

}

function trackModalChanges(enabled, settings)
{
    if(enabled || enabled == undefined){
        MainPopup().closeConf(null, settings);
        $('.with-modal').delegate('input:not(.checkAllTable, .noChg), textarea', 'change', function(){ MainPopup().closeConf(true, settings); });
        $('.with-modal').delegate('.noConf', 'click', function () { MainPopup().closeConf(false, settings); });
    }
    else 
    {
        MainPopup().closeConf(false); 
        $('.with-modal').undelegate('input:not(.checkAllTable, .noChg), textarea', 'change'); 
        $('.with-modal').undelegate('.stopTracking', 'click', function(){ MainPopup().closeConf(false); });
    }
}

function SetupFolderHistory(currentItem){
    if(parent && parent.mastheadframe && parent.mastheadframe.FolderHistory != null){
        if(parent.mastheadframe.folderHist == null) parent.mastheadframe.folderHist = new FolderHistory();
    } else return;
    var fh = parent.mastheadframe.folderHist;
    fh.setCurrent(currentItem);
    if(fh.hasBack()) $('#cHeadNav a.fnav-ba').removeClass('btn-disabled').click(function(){ location.href = fh.goBack(); });
    if(fh.hasFwd()) $('#cHeadNav a.fnav-fw').removeClass('btn-disabled').click(function(){ location.href = fh.goFwd(); });
}

function callIFrameAjax(externalPage, args)
{ 
	args = args + '&guid=' + getGuid();
	var asynchCall = '<iframe width="100" height="100" style="display:none;" src="' + externalPage + args + '"></iframe>';
	
	document.getElementById('asynchEngine').innerHTML = asynchCall;	
}

function getGuid()
{
	var upperLimit = 10000000000;
	var randomNumber = Math.floor(Math.random()*upperLimit);
	
	return 'r' + randomNumber.toString();
}

function haveSelected(sel, min,max)
{
    if (min == null) min = 1;
    
    var numberSelectedItems = $(sel).length;
    
    if (numberSelectedItems == 0)
    {
        displayMessage('Error', 'No items have been selected.');
        clearProcessingMessages(true);
        return false;
    }
    else if (max != null && numberSelectedItems > max)
    {
        displayMessage('Error', 'You may only process ' + max + ' item(s) at a time.');
        clearProcessingMessages(true);
        return false;
    }
    
    if (max == null)
        return numberSelectedItems >= min;
    else
        return numberSelectedItems >= min && numberSelectedItems <= max;
}

function preprocessData(data, type) {
    if (type === 'text') {
        var msg = eval('(' + data + ')');
        if (msg.hasOwnProperty('d')) return msg.d;
        else return msg;
    }
    else if (type === 'json') {
        var msg = eval('(' + data + ')');
        if (msg.hasOwnProperty('d')) return JSON.stringify(msg.d);
    }
    return data;
}

function LengthValidator_CheckLength(src, args)
{
    args.IsValid = false;

    if (args.Value.length >= parseInt(src.minlength) && args.Value.length <= parseInt(src.maxlength)) //check if the content is between 6 and 10 characters
    {
        args.IsValid = true;
    }
}

// Reload or load a page. Reloads don't POST the form to the server again.
function loadPage(href)
{
    if(!href) href = window.location.href;
    // Ending in '#' breaks reloads, so trim it if it's there.
    if(href.match(/\#$/)) href = href.slice(0, href.length - 1);
    window.location.replace(href);
}

//calls jquery's .replaceWith function with the selector and html specified
//created so treeview can change things in the content frame
function jqueryReplaceWith(selector, source) {
    $(selector).replaceWith(source);
}

//takes a selector and returns a jquery object from it.
//This is needed for tree view as it cannot get elements across the frameset
function jquerySelector(selector) {
    return $(selector)
}

function MainTree()
{
    if(parent.mastheadframe && parent.mastheadframe.treeview) return parent.mastheadframe.treeview;
    else if(parent.parent.mastheadframe && parent.parent.mastheadframe.treeview) return parent.parent.mastheadframe.treeview;
    else return null;
}

function LoadTree()
{
    if(parent.mastheadframe && parent.mastheadframe.treeview)
        parent.mastheadframe.treeview.reload();
    else if(!parent.mastheadframe) { $('#ctl00_slidewindow .errortip').removeClass('hidden'); }
}

$(document).ready(function () {
    pageCtrlInit();

    if (!isMobile) {
        if (!$('body').hasClass('with-modal') && getPreference("Extra_UnlockWidth") != "1") {
            setupWinSize(true);
            $(window).resize(function () {
                if (!resizeRequested) {
                    resizeRequested = true;
                    window.setTimeout(setupWinSize, 300);
                }
            });
        }
        LoadTree();
    }
});

$(window).load(function() {
    // Window load fires after all content is loaded. These aren't as necessary to the page functions, and can load later on.
    if (isLegacyFF) {
        $('#ctl00_additionalJS').append('<style type="text/css"> .trunc tbody td,.trunc tbody td span, .trunctxt { word-wrap: break-word; text-overflow:ellipsis; overflow: visible; white-space:normal; } .trunctxt { width: auto; } </style>');
        reflowTruncated();
    }
});

// Some init steps are safe to do before document ready:
// Pull down runOnceJS when possible
runOnceJS();
setupRounded('div.r-outer');
buttonSetup('body');
MainPopup(); // Init main popup
$('#ctl00_btnPageTop').click(function(){$('body,#outer-outer').animate({scrollTop: 0}, 300)}); 