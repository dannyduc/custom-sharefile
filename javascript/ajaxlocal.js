/// Ajax = Asynchronous JavaScript + XML (+ HTML)
/// Ajax framework for Internet Explorer (6.0, ...) and Firefox (1.0, ...)
/// by Matthias Hertel
/// More information on: http://ajaxaspects.blogspot.com/ and http://ajaxaspekte.blogspot.com/
/// -----
/// ajax.js: Common Javascript methods and global objects
/// 05.06.2005 creation.
/// 19.06.2005 minor corrections to webservices.
/// 25.06.2005 ajax action queue and timing.
/// 02.07.2005 queue up actions fixed.
/// ajax.timeout

// ----- global variable for the proxies to webservices. -----

/// <summary>The root object for the proxies to webservices.</summary>
var proxies = new Object();

proxies.current = null; // the current active webservice call.
proxies.xmlhttp = null; // The current active xmlhttp object.


// ----- global variable for the ajax engine. -----

/// <summary>The root object for the ajax engine.</summary>
var ajax = new Object();

ajax.current = null; /// The current active AJAX action.
ajax.queue = new Array(); /// The pending AJAX actions.
ajax.timer = null; /// The timer for delayed actions.


// ----- AJAX engine and actions implementation -----

///<summary>Start an AJAX action by entering it into the queue</summary>
ajax.Start = function (action) {

  if (action == null) {
    alert("Argument action must be set.");
    return;

  } else if ((action.queueClear != null) && (action.queueClear == true)) {
    ajax.queue = new Array();

  } else if ((ajax.queue.length > 0) && ((action.queueMultiple == null) || (action.queueMultiple == false))) {
    // remove existing action entries from the queue and clear a running timer
    if ((ajax.timer != null) && (ajax.queue[0] == action)) {
      window.clearTimeout(ajax.timer);
      ajax.timer = null;
    } // if
    
    var n = 0;
    while (n < ajax.queue.length) {
      if (ajax.queue[n] == action)
        ajax.queue.splice(n, 1);
      else
        n++;
    } // while
  } // if
  
  if ((action.queueTop == null) || (action.queueTop == false))
    ajax.queue.push(action); // to the end.
  else
    ajax.queue.unshift(action); // to the top
  
  // check if the action should start
  ajax.Next(false);
} // ajax.Start


///<summary>Check, if the next AJAX action can start.</summary>
ajax.Next = function (forceStart) {
  if (ajax.current != null)
    return; // a call is active: wait more time

  if (ajax.timer != null)
    return; // a call is pendig: wait more time

  if (ajax.queue.length == 0)
    return; // nothing to do.
  
  var ca = ajax.queue[0];
  var data = null;
  if ((forceStart == true) || (ca.delay == null) || (ca.delay == 0)) {
    // start top action
    ajax.queue.shift();
    ajax.current = ca;
    
    // get the data
    if (ca.prepare != null)
      data = ca.prepare();

    if (ca.call == null) {
      // no call
      ajax.Finsh(data);
    } else { 
      // start the call
      ca.call.func = ajax.Finsh;
      ca.call.onException = ajax.Exception;
      ca.call(data);
      // start timeout timer
      if (ca.timeout != null)
        ajax.timer = window.setTimeout(ajax.EndTimeout, ca.timeout * 1000);
    } // if
    
  } else {
    // start a timer and wait
    ajax.timer = window.setTimeout(ajax.EndWait, ca.delay);
  } // if
} // ajax.Next


///<summary>The delay time of an action is over.</summary>
ajax.EndWait = function() {
  ajax.timer = null;
  ajax.Next(true);
} // ajax.EndWait


///<summary>The current action timed out.</summary>
ajax.EndTimeout = function() {
  proxies.cancel(); // cancel the current webservice call.
  ajax.timer = null;
  ajax.current = null;
  window.setTimeout(ajax.Next, 200); // give some to time to cancel the http connection.
  // ajax.Next(false);
} // ajax.EndTimeout


// Finish an AJAX Action the normal way
ajax.Finsh = function (data) {
  // clear timeout timer if set
  if (ajax.timer != null) {
    window.clearTimeout(ajax.timer);
    ajax.timer = null;
  } // if

  // use the data
  if ((ajax.current != null) && (ajax.current.finish != null))
    ajax.current.finish(data);
  // reset the running action
  ajax.current = null;
  ajax.Next(false)
} // ajax.Finsh


// Finish an AJAX Action with an exception
ajax.Exception = function (ex) {
  // use the data
  if (ajax.current.onException != null)
    ajax.current.onException(ex);
  // reset the running action
  ajax.current = null;
} // ajax.Exception


// ----- webservice proxy implementation -----

///<summary>Execute a soap call.
///Build the xml for the call of a soap method of a webservice
///and post it to the server.</summary>
proxies.callSoap = function (args) {
  var p = args.callee;
  proxies.current = p;
  
  var x = getXMLHTTP();
  proxies.xmlhttp = x;

  // envelope start
  var soap = "<?xml version='1.0' encoding='utf-8'?>"
    + "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>"
    + "<soap:Body>"
    + "<" + p.fname + " xmlns='" + p.service.ns + "'>";

  // parameters    
  for (n = 0; (n < p.params.length) && (n < args.length); n++)
    soap += "<" + p.params[n] + ">" + args[n] + "</" + p.params[n] + ">"

  // envelope end
  soap += "</" + p.fname + ">"
    + "</soap:Body>"
    + "</soap:Envelope>";
    
  x.open("POST", p.service.url, (p.func != null)); //Post to a local delegate to enable remote domain requests
  //x.open("POST", p.service.url, (p.func != null));
  x.setRequestHeader("SOAPAction", p.action);
  x.setRequestHeader("Content-Type", "text/xml; charset=utf-8");

  if (p.corefunc != null) {
    // async call with xmlhttp-object as parameter
    x.onreadystatechange = p.corefunc;
    x.send(soap);

  } else if (p.func != null) {
    // async call
    x.onreadystatechange = proxies.response;
    x.send(soap);

  } else {
    // sync call
    x.send(soap);
    return(proxies.response());
  } // if
} // proxies.callSoap


// cancel the running webservice call.
proxies.cancel = function() {
  var cc = proxies.current;
  var cx = proxies.xmlhttp;
  
  if (proxies.xmlhttp != null) {
    proxies.xmlhttp.onreadystatechange = function() { };
    proxies.xmlhttp.abort();
    if (proxies.current.onException != null)
      proxies.current.onException("WebService call was canceled.")
    proxies.current = null;
    proxies.xmlhttp = null;
  } // if
} // proxies.cancel


///<summary>Callback method for a webservice call that dispatches the response to servive.func or service.onException.</summary>
proxies.response = function () {
  var ret = null;
  var x = proxies.xmlhttp;

  if ((x != null) && (x.readyState == 4)) {
    if (x.status == 200) {
      var xNode = x.responseXML.documentElement.firstChild.firstChild.firstChild;
      if ((xNode != null) && (xNode.firstChild != null))
        ret = xNode.firstChild.nodeValue;
      if (proxies.current.func == null)
        return(ret); // sync
      else
        proxies.current.func(ret); // async 

    } else if (proxies.current.onException == null) {
       // no exception

    } else {
      // raise an exception 
      ret = new Error();

      if (x.status == 404) {
        ret.message = "The webservice could not be found.";

      } else if (x.status == 500) {
        ret.name = "SoapException";
        var n = x.responseXML.documentElement.firstChild.firstChild.firstChild;
        while (n != null) {
          if (n.nodeName == "faultcode") ret.message = n.firstChild.nodeValue;
          if (n.nodeName == "faultstring") ret.description = n.firstChild.nodeValue;
          n = n.nextSibling;
        } // while
   
      } else if ((x.status == 502) || (x.status == 12031)) {
        ret.message = "The server could not be found.";

      } else {
        // no classified response.
        ret.message = "Result-Status:" + x.status + "\n" + x.responseText;
      } // if
      proxies.current.onException(ret);
    } // if
    
    proxies.xmlhttp = null;
    proxies.current = null;
  } // if
} // proxies.response


///<summary>Callback method to show the result of a soap call in an alert box.</summary>
///<remarks>To set up a debug output in an alert box use:
///proxies.CalcService.CalcPrimeFactors.corefunc = wsAlertResult;</remarks>
function wsAlertResult() {
  var x = proxies.xmlhttp;
  
  if (x.readyState == 4) {
    if (x.status == 200) {
     if (x.responseXML.documentElement.firstChild.firstChild.firstChild == null)
       alert("(no result)");
     else
       alert(x.responseXML.documentElement.firstChild.firstChild.firstChild.firstChild.nodeValue);

    } else if (x.status == 404) { alert("Error!\n\nThe webservice could not be found.");

    } else if (x.status == 500) {
      // a SoapException
      var ex = new Error();
      ex.name = "SoapException";
      var n = x.responseXML.documentElement.firstChild.firstChild.firstChild;
      while (n != null) {
        if (n.nodeName == "faultcode") ex.message = n.firstChild.nodeValue;
        if (n.nodeName == "faultstring") ex.description = n.firstChild.nodeValue;
        n = n.nextSibling;
      } // while
      alert("The server threw an exception.\n\n" + ex.message + "\n\n" + ex.description);
    
    } else if (x.status == 502) { alert("Error!\n\nThe server could not be found.");

    } else {
      // no classified response.
      alert("Result-Status:" + x.status + "\n" + x.responseText);
    } // if
    
    proxies.xmlhttp = null;
    proxies.current = null;
  } // if
} // wsAlertResult


///<summary>Show all the details of the returned data of a webservice call.
///Use this method for debugging transmission problems.</summary>
///<remarks>To set up a debug output in an alert box use:
///proxies.CalcService.CalcPrimeFactors.corefunc = wsAlertResponseText;</remarks>
function wsAlertResponseText() {
 if (proxies.xmlhttp.readyState == 4)
   alert("Status:" + proxies.xmlhttp.status + "\nRESULT:" + proxies.xmlhttp.responseText);
} // wsAlertFullResult


// ----- utilities -----

///<summary>Get a browser specific implementation of the XMLHTTP object.</summary>
function getXMLHTTP() {
  var obj = null;

  try {
    obj = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { }

  if (obj == null) {
    try {
      obj = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) { }
  } // if
  
  if ((obj == null) && (typeof XMLHttpRequest != "undefined"))
    obj = new XMLHttpRequest();
  return(obj);
} // getXMLHTTP


///<summary>show the details about an exception.</summary>
function alertException(ex) {
  var s = "Exception:\n\n";

  if (ex.constructor == String) {
    s = ex;
  } else {
    if ((ex.name != null) && (ex.name != ""))
      s += "Type: " + ex.name + "\n\n";
      
    if ((ex.message != null) && (ex.message != ""))
      s += "Message:\n" + ex.message + "\n\n";

    if ((ex.description != null) && (ex.description != "") && (ex.message != ex.description))
      s += "Description:\n" + ex.description + "\n\n";
  } // if
  //alert(s);
} // alertException


///<summary>show the details of a javascript object.</summary> 
///<remarks>This helps a lot while developing and debugging.</remarks> 
function inspectObj(obj) {
  var s = "InspectObj:";
  
  if (obj.constructor == String)
    s = "\"" + obj + "\"";
  else if (obj.constructor == Array)
    s += " _ARRAY";
  else if (typeof(obj) == "function")
    s += " [function]" + obj;
      
  for (p in obj) {
    try {
      if (obj[p] == null) {
        s += "\n" + String(p) + " (...)";

      } else if (typeof(obj[p]) == "function") {
        s += "\n" + String(p) + " [function]";

      } else if (obj[p].constructor == Array) {
        s += "\n" + String(p) + " [ARRAY]: " + obj[p];
        for (n = 0; n < obj[p].length; n++)
          s += "\n  " + n + ": " + obj[p][n];

      } else {
        s += "\n" + String(p) + " [" + typeof(obj[p]) + "]: " + obj[p];
      } // if
    } catch (e) { s+= e;}
  } // for
  alert(s);
} // inspectObj

// ----- End -----
