 /* This script and many more are available free online at
The JavaScript Source :: http://javascript.internet.com
Created by: Joost de Valk :: http://www.joostdevalk.nl/ */

/*
Table sorting script, taken from http://www.kryogenix.org/code/browser/sorttable/ .
Distributed under the MIT license: http://www.kryogenix.org/code/browser/licence.html .

Adaptation by Joost de Valk (http://www.joostdevalk.nl/) to add alternating row classes as well.

Copyright (c) 1997-2006 Stuart Langridge, Joost de Valk.
*/

/* Change these values */
var image_path = "";
var image_up = "styles/default/img/sortArrow-up.png";
var image_down = "styles/default/img/sortArrow-down.png";
var image_none = "styles/default/arrow-none.gif";
var useGroupedSort = true;

/* Don't change anything below this unless you know what you're doing */
//addEvent(window, "load", sortables_init);

var SORT_COLUMN_INDEX;
var START_ROW = 1;
var IS_DESCENDING = 1;
thead = false;

function sortables_init() 
{
    // Find all tables with class sortable and make them sortable
    if (!document.getElementsByTagName)
        return;
    tbls = document.getElementsByTagName("table");
    for (ti = 0; ti < tbls.length; ti++) 
    {
        thisTbl = tbls[ti];
        if (((' ' + thisTbl.className + ' ').indexOf("sortable") != -1) && (thisTbl.id)) 
        {
            ts_makeSortable(thisTbl, ti);
        }
    }
}

function sortables_jq(parent) 
{
    // Find all tables with class sortable and make them sortable
    if (parent == null)
        parent = '';
    var $tables = $(parent + ' table.sortable');
    $tables.each(function(idx) {
        ts_makeSortable(this, idx);
    });
}

function ts_makeSortable(table, tableIndex) 
{
    if (table.rows && table.rows.length > 0) {
        if (table.tHead && table.tHead.rows.length > 0) {
            var firstRow = table.tHead.rows[table.tHead.rows.length - 1];
            thead = true;
            START_ROW = 1;
        } else {
            var firstRow = table.rows[0];
        }
    }
    if (!firstRow)
        return;

    // We have a first row: assume it's the header, and make its contents clickable links
    for (var i = 0; i < firstRow.cells.length; i++) 
    {
        var cell = firstRow.cells[i];
        var txt = ts_getInnerText(cell);
        if (cell.className != "unsortable" && cell.className.indexOf("unsortable") == -1) 
        {
            if (cell.className.indexOf('desc') > -1)
                sortdir = 'down';
            else
                sortdir = 'up';

            //Set the path of the initial arrow image, depending on what we are told about initial sorting
            var initArrowImagePath = image_none;
            if (cell.className.indexOf('initAsc') > -1) 
            {
                initArrowImagePath = image_up;
                sortdir = 'down'; //Since we start ascending, next we'll want descending
            } 
            else if (cell.className.indexOf('initDesc') > -1) 
            {
                initArrowImagePath = image_down;
                sortdir = 'up'; //Since we start decending, next we'll want ascending        
            }
            
            var columnID = 'sortLink_' + tableIndex.toString() + '_' + i.toString();
            var arrowID = 'sortArrow_' + tableIndex.toString() + '_' + i.toString();

            //cell.innerHTML = '<a href="#" class="sortheader" onclick="ts_resortTable(this);return false;"><span class="sorttitle">'+txt+'</span><span class="sortarrow">  <img src="'+ image_path + image_none + '" alt="?" border="0"/></span></a>';
            cell.innerHTML = '<a href="#" id="' + columnID + '" class="sortheader" onclick="ts_resortTable(this);return false;"><span class="sorttitle" sortdir="' + sortdir + '">' + txt + '</span></a><span id="' + arrowID + '" class="sortarrow" sortdir="' + sortdir + '">  <img src="' + image_path + initArrowImagePath + '" border="0"/></span>';
        }
    }
    
    if (table.rows && table.rows.length < 3000)
        alternate(table);
}

function ts_getInnerText(el, getAlt) {
    var type = typeof el;
    if (type == "string" || type == "undefined")
        return el;
    if (getAlt && el.attributes.getNamedItem('altsort')) {
        return el.attributes.getNamedItem('altsort').value;
    } 
    else if (!getAlt && el.innerText)
        return el.innerText; //Not needed but it is faster
    var str = "";
    var cs = el.childNodes;
    var l = cs.length;
    for (var i = 0; i < l; i++) {
        switch (cs[i].nodeType) {
            case 1: // element_node
                str += ts_getInnerText(cs[i], getAlt);
                break;
            case 3: // text_node
                str += cs[i].nodeValue;
                break;
        }
    }
    return str;
}

function ts_resortTable_callback(callbackFunctionName, columnIndex, isDescending, tableID) 
{
    if (callbackFunctionName != null) 
    {
        var callString = callbackFunctionName + '(' + columnIndex + ',' + isDescending + ',\'' + tableID + '\');';
        eval(callString);
    }
}

function ts_resortTable(lnk) {

    // get the span
    var span;
    for (var ci = 0; ci < lnk.childNodes.length; ci++) 
    {
        //if (lnk.childNodes[ci].tagName && lnk.childNodes[ci].tagName.toLowerCase() == 'span') span = lnk.childNodes[ci];
        
        var linkID = lnk.id;
        var arrowID = linkID.replace('Link', 'Arrow');
        span = document.getElementById(arrowID);
    }
    var spantext = ts_getInnerText(span);
    var td = lnk.parentNode;
    var column = getCellIndex(td);
    var table = getParent(td, 'TABLE');

    //See if a callback is requested when the sort is finished
    var callbackFunctionName = null;
    var isDescending = false;
    if (table.className.indexOf('callback_') > -1) 
    {
        //First, get everything after "callback"
        var tempArray = table.className.split('callback_');
        callbackFunctionName = tempArray[1];

        //Now, if there's another class (indicated by a white space) get rid of that
        if (callbackFunctionName.indexOf(' ') > -1) 
        {
            tempArray = callbackFunctionName.split(' ');
            callbackFunctionName = tempArray[0];
        }
    }

    // Work out a type for the column
    if (table.rows.length <= START_ROW)
        return;
    sortfn = ts_sort_caseinsensitive;
    
    var colHeaderIndex = START_ROW - 1;
    if (colHeaderIndex < 0)
        colHeaderIndex = 0;
    
    var colitm = table.rows[colHeaderIndex].cells[column];
    
    if (colitm.className.indexOf('sortFunc_') > -1) 
    {
        //Get the sort function
        var sortFuncParts = colitm.className.split('sortFunc_');
        var sortFuncRaw = sortFuncParts[1];
        if (sortFuncRaw.indexOf(' ') > -1) 
        {
            sortFuncParts = sortFuncRaw.split(' ');
            sortFuncRaw = sortFuncParts[0];
        }
        
        if (sortFuncRaw) {
            // You can use natural sort if you asked for it, and you aren't a deprecated browser, and you have less than 2k rows
            var useNatural = sortFuncRaw.indexOf('Nat') != -1 && !isLegacyBrowser && table.rows && table.rows.length < 2000;
            
            if (sortFuncRaw.indexOf('sd') == 0)
                sortfn = useNatural ? ts_sort_natural : ts_sort_caseinsensitive;
            else if (sortFuncRaw.indexOf('altAttr') == 0)
                sortfn = useNatural ? ts_sortnat_alt_attr : ts_sort_alt_attr;
            else if (sortFuncRaw.indexOf('altValSort') == 0)
                sortfn = ts_sort_alt_value;
            else if (sortFuncRaw.indexOf('altNum') == 0)
                sortfn = ts_sort_alt_numeric;
        }
    } 
    else 
    {
        try 
        {
            var itm = ts_getInnerText(table.rows[START_ROW].cells[column]);
            if (itm.match(/^\d\d[\/-]\d\d[\/-]\d\d\d\d$/))
                sortfn = ts_sort_date;
            if (itm.match(/^\d\d[\/-]\d\d[\/-]\d\d$/))
                sortfn = ts_sort_date;
            if (itm.match(/^[�$�]/))
                sortfn = ts_sort_currency;
            if (itm.match(/^[\d\.]+$/))
                sortfn = ts_sort_numeric;
        } 
        catch (err) {
        }
    }
    
    SORT_COLUMN_INDEX = column;
    var firstRow = new Array(), 
    newRows = new Array();
    
    for (i = 0; i < table.rows[0].length; i++) 
    {
        firstRow[i] = table.rows[0][i];
    }
    
    for (j = START_ROW; j < table.rows.length; j++) 
    {
        newRows[j - START_ROW] = table.rows[j];
    }


    //Set a variable to indicate whether to flip the sort order
    if (span.getAttribute("sortdir") == 'down')
        IS_DESCENDING = -1;
    else
        IS_DESCENDING = 1;
    
    newRows.sort(sortfn);
    
    if (span.getAttribute("sortdir") == 'down') 
    {
        ARROW = '  <img src="' + image_path + image_down + '" border="0"/>';
        //newRows.reverse();
        isDescending = true;
        span.setAttribute('sortdir', 'up');
    } 
    else 
    {
        ARROW = '  <img src="' + image_path + image_up + '" border="0"/>';
        span.setAttribute('sortdir', 'down');
    }


    // We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
    // don't do sortbottom rows
    var tbZero = table.tBodies[0];
    for (i = 0; i < newRows.length; i++) 
    {
        // SF is not currently using sortbottom, but maybe we could use it instead of group sort later?
        //if (!newRows[i].className || (newRows[i].className && (newRows[i].className.indexOf('sortbottom') == -1))) 
        //{
        tbZero.appendChild(newRows[i]);
    //}
    }

    /*// do sortbottom rows only
  for (i = 0; i < newRows.length; i++) 
  {
    if (newRows[i].className && (newRows[i].className.indexOf('sortbottom') != -1))
      table.tBodies[0].appendChild(newRows[i]);
  }*/

    // Delete any other arrows there may be showing
    var allspans = document.getElementsByTagName("span");
    for (var ci = 0; ci < allspans.length; ci++) 
    {
        if (allspans[ci].className == 'sortarrow') 
        {
            if (getParent(allspans[ci], "table") == getParent(lnk, "table"))  // in the same table as us?
            {
                allspans[ci].innerHTML = '  <img src="' + image_path + image_none + '" border="0"/>';
            }
        }
    }
    
    span.innerHTML = ARROW;
    if (table.rows && table.rows.length < 3000)
        alternate(table);

    //Call a function to do any callbacks necessary after the sort is completed
    ts_resortTable_callback(callbackFunctionName, SORT_COLUMN_INDEX, isDescending, table.id);
}

function getParent(el, pTagName) {
    if (el == null) {
        return null;
    } else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase()) { // Gecko bug, supposed to be uppercase
        return el;
    } else {
        return getParent(el.parentNode, pTagName);
    }
}

function getCellIndex(td) 
{
    for (var i = 0; i < td.parentNode.cells.length; i++) 
    {
        if (td.parentNode.cells[i] == td)
            return i;
    }
    
    return 0;
}

function checkGroupSort(a, b) 
{
    if (useGroupedSort == true) 
    {
        //See if these items are in different groups
        if (a.className.indexOf('groupSort_') > -1 && b.className.indexOf('groupSort_') > -1) 
        {
            var aParts = a.className.split('groupSort_');
            var aGroup = aParts[1];
            if (aGroup.indexOf(' ') > -1) 
            {
                aParts = aGroup.split(' ');
                aGroup = aParts[0];
            }
            
            var bParts = b.className.split('groupSort_');
            var bGroup = bParts[1];
            if (bGroup.indexOf(' ') > -1) 
            {
                bParts = bGroup.split(' ');
                bGroup = bParts[0];
            }
            
            if (aGroup == bGroup)
                return -2;
            else if (aGroup > bGroup)
                return 1;
            else
                return -1;
        } 
        else
            return -2;
    } 
    else
        return -2;
}

function ts_sort_date(a, b) {

    //Check group sort
    var gs = checkGroupSort(a, b);
    if (gs > -2)
        return gs;
    
    aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
    bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
    if (aa.length == 10) {
        dt1 = aa.substr(6, 4) + aa.substr(3, 2) + aa.substr(0, 2);
    } else {
        yr = aa.substr(6, 2);
        if (parseInt(yr) < 50) {
            yr = '20' + yr;
        } else {
            yr = '19' + yr;
        }
        dt1 = yr + aa.substr(3, 2) + aa.substr(0, 2);
    }
    if (bb.length == 10) {
        dt2 = bb.substr(6, 4) + bb.substr(3, 2) + bb.substr(0, 2);
    } else {
        yr = bb.substr(6, 2);
        if (parseInt(yr) < 50) {
            yr = '20' + yr;
        } else {
            yr = '19' + yr;
        }
        dt2 = yr + bb.substr(3, 2) + bb.substr(0, 2);
    }
    if (dt1 == dt2) {
        return 0;
    }
    if (dt1 < dt2) {
        return -1 * IS_DESCENDING;
    }
    return 1 * IS_DESCENDING;
}

function ts_sort_currency(a, b) {

    //Check group sort
    var gs = checkGroupSort(a, b);
    if (gs > -2)
        return gs;
    
    aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]).replace(/[^0-9.]/g, '');
    bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]).replace(/[^0-9.]/g, '');
    return (parseFloat(aa) - parseFloat(bb)) * IS_DESCENDING;
}

function ts_sort_numeric(a, b) {

    //Check group sort
    var gs = checkGroupSort(a, b);
    if (gs > -2)
        return gs;
    
    aa = parseFloat(ts_getInnerText(a.cells[SORT_COLUMN_INDEX]));
    if (isNaN(aa)) {
        aa = 0;
    }
    bb = parseFloat(ts_getInnerText(b.cells[SORT_COLUMN_INDEX]));
    if (isNaN(bb)) {
        bb = 0;
    }
    return (aa - bb) * IS_DESCENDING;
}

function ts_sort_alt_numeric(a, b) {

    //Check group sort
    var gs = checkGroupSort(a, b);
    if (gs > -2)
        return gs;
    
    aa = parseFloat(ts_getInnerText(a.cells[SORT_COLUMN_INDEX], true));
    if (isNaN(aa)) {
        aa = 0;
    }
    bb = parseFloat(ts_getInnerText(b.cells[SORT_COLUMN_INDEX], true));
    if (isNaN(bb)) {
        bb = 0;
    }
    return (aa - bb) * IS_DESCENDING;
}

function ts_sort_caseinsensitive(a, b, getAlt, skipGrp) {
    
    if (!skipGrp) {
        //Check group sort
        var gs = checkGroupSort(a, b);
        if (gs > -2)
            return gs;
    }
    
    var aCell = a.cells[SORT_COLUMN_INDEX];
    var bCell = b.cells[SORT_COLUMN_INDEX];
    aa = aCell ? ts_getInnerText(aCell, getAlt).toLowerCase() : '';
    bb = bCell ? ts_getInnerText(bCell, getAlt).toLowerCase() : '';
    
    if (aa == bb) {
        return 0;
    }
    if (aa < bb) {
        return -1 * IS_DESCENDING;
    }
    return 1 * IS_DESCENDING;
}

function ts_sort_natural(a, b, getAlt, skipGrp) {
    
    if (!skipGrp) {
        //Check group sort
        var gs = checkGroupSort(a, b);
        if (gs > -2)
            return gs;
    }
    
    aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX], getAlt);
    bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX], getAlt);
    
    return alphanum.cmp(aa, bb) * IS_DESCENDING;
}
/*
   * These functions are a little slower than ts_sort_alt_value, since it makes sort_caseinsensitive 
   * do extra work, but a lot more flexible in what can be alt text. You can have phrases with
   * whitespace as alt value text instead of just an unbroken string. Format is: altSort="alt sort text"
   */
function ts_sort_alt_attr(a, b) {
    return ts_sort_caseinsensitive(a, b, true);
}
function ts_sortnat_alt_attr(a, b) {
    return ts_sort_natural(a, b, true);
}

function ts_sort_alt_value(a, b) {

    /*
   * This sort function looks in the cell for a span with a class that indicates a 
   * value for string comparison. It's good if you know on the server-side what order 
   * to use, but in the UI you display an image or some other formatting of items that 
   * could not be sorted effectively.
   */

    //Check group sort
    var gs = checkGroupSort(a, b);
    if (gs > -2)
        return gs;
    
    aa = a.cells[SORT_COLUMN_INDEX].innerHTML;
    bb = b.cells[SORT_COLUMN_INDEX].innerHTML;

    //If these items don't have a sortValue parameter, just use a normal sort
    if (aa.indexOf('sortValue_') == -1 || bb.indexOf('sortValue_') == -1)
        return ts_sort_caseinsensitive(a, b, false, true);

    //Parse just what we need
    var aaParts = aa.split('sortValue_');
    aa = aaParts[1];

    //In these next two lines, trying to find the index of the first space or double quote
    var aaStop = aa.indexOf('"');
    if (aaStop == -1)
        aaStop = aa.indexOf('>'); //Fix for IE which strips the double quotes
    if (aa.indexOf(' ') > -1 && aa.indexOf(' ') < aaStop)
        aaStop = aa.indexOf(' ');
    aa = aa.substring(0, aaStop);

    //Parse just what we need
    var bbParts = bb.split('sortValue_');
    bb = bbParts[1];

    //In these next two lines, trying to find the index of the first space or double quote
    var bbStop = bb.indexOf('"');
    if (bbStop == -1)
        bbStop = bb.indexOf('>'); //Fix for IE which strips the double quotes
    if (bb.indexOf(' ') > -1 && bb.indexOf(' ') < bbStop)
        bbStop = bb.indexOf(' ');
    bb = bb.substring(0, bbStop);
    
    if (aa == bb) {
        return 0;
    }
    if (aa < bb) {
        return -1 * IS_DESCENDING;
    }
    return 1 * IS_DESCENDING;
}

function ts_sort_default(a, b) {

    //Check group sort
    var gs = checkGroupSort(a, b);
    if (gs > -2)
        return gs;
    
    aa = ts_getInnerText(a.cells[SORT_COLUMN_INDEX]);
    bb = ts_getInnerText(b.cells[SORT_COLUMN_INDEX]);
    if (aa == bb) {
        return 0;
    }
    if (aa < bb) {
        return -1 * IS_DESCENDING;
    }
    return 1 * IS_DESCENDING;
}

function addEvent(elm, evType, fn, useCapture) {
    // addEvent and removeEvent
    // cross-browser event handling for IE5+, NS6 and Mozilla
    // By Scott Andrew
    
    if (elm.addEventListener) {
        elm.addEventListener(evType, fn, useCapture);
        return true;
    } else if (elm.attachEvent) {
        var r = elm.attachEvent("on" + evType, fn);
        return r;
    } else {
    //alert("Handler could not be removed");
    }
}

function replace(s, t, u) {
    /*
  **  Replace a token in a string
  **    s  string to be processed
  **    t  token to be found and removed
  **    u  token to be inserted
  **  returns new String
  */
    i = s.indexOf(t);
    r = "";
    if (i == -1)
        return s;
    r += s.substring(0, i) + u;
    if (i + t.length < s.length)
        r += replace(s.substring(i + t.length, s.length), t, u);
    return r;
}

var checkForNoAlt = false;
function alternate(table) {
    var start = START_ROW;
    if (thead)
        start = 0;
    altTable(table, start);
}

function altTable(tb, startAt) {
    startAt = startAt || 0;
    // If we weren't given a tbody, find it
    var tableBodies = [tb];
    if (tb && tb.tagName && tb.tagName.toLowerCase() != 'tbody') {
        tableBodies = tb.getElementsByTagName("tbody");
    }
    var tbLen = tableBodies.length;

    // Loop through these tbodies
    for (var i = 0; i < tbLen; i++) {
        // Take the tbody, and get all it's rows
        var tableRows = tableBodies[i].getElementsByTagName("tr"), trLen = tableRows.length;
        // Loop through these rows
        // Start at 1 because we want to leave the heading row untouched
        
        var offset = 0;
        for (var j = startAt; j < trLen; j++) {
            // Check if j is even, and apply classes for both possible results
            var mod = j + offset;
            
            var incrementOffset = checkForNoAlt && tableRows[j].className.indexOf('noAlt') != -1;
            
            if (!checkForNoAlt || !incrementOffset) {
                if (!(mod % 2)) {
                    if (!(tableRows[j].className.indexOf('odd') == -1)) {
                        tableRows[j].className = tableRows[j].className.replace('odd', '');
                    }
                } else {
                    if (tableRows[j].className.indexOf('odd') == -1) {
                        tableRows[j].className += " odd";
                    }
                
                }
            } 
            else if (incrementOffset) {
                offset++;
            }
        }
    }
}

/* alphanum.js (C) Brian Huisman Modified for ShareFile, Based on the Alphanum Algorithm by David Koelle The Alphanum Algorithm is discussed at http://www.DaveKoelle.com */
var alphanum = function() {
    var h = {}, g = function(d) {
        if (h[d])
            return h[d];
        for (var e = [], b = 0, a = -1, f = 0, c, g; c = (g = d.charAt(b++)).charCodeAt(0); ) {
            var i = 48 <= c && 57 >= c;
            if (46 == c || i !== f)
                e[++a] = "", f = i;
            e[a] += g
        }
        return h[d] = e
    };
    return {cmp: function(d, e) {
            var b = g(d.toLowerCase()), a = g(e.toLowerCase());
            for (x = 0; b[x] && a[x]; x++)
                if (b[x] !== a[x]) {
                    var f = Number(b[x]), c = Number(a[x]);
                    return f == b[x] && c == a[x] ? f - c : b[x] > a[x] ? 1 : -1
                }
            return b.length - a.length
        },clearCache: function() {
            h = {}
        }}
}();
