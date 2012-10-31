 /// <reference path="jquery-latest.js" />
var keyEventToListen = $.browser.opera ? "keypress" : "keyup", 
currentSearchQueryString;

$(document).ready(function() {
    var requiresFixedWidth = checkIt('msie 6') > 0 || checkIt('msie 7') > 0;
    $('.search-link').standardSearch('#query', '#mastSearchType', '#mastSrch');
    $('#query').instantSearch(navBarResponseHandler, {resultsAsModal: true,disableEnterKey: true,instantSearchEnabled: SF.user.canInstantSearch}, navBarSearchStart, navBarSearchEnd);
    
    function navBarResponseHandler(resp, container, src, cache) {
        if (cache.key != currentSearchQueryString || advanced) {
            $(container).removeClass('hidden');
            var temp = $(resp.Result);
            $(container).html(temp);
            reposition(container, src);
        }
        
        if (!cache.fromCache) {
            $.InstantSearch.cache[cache.key] = {
                Response: resp,
                Timestamp: new Date().getTime()
            };
        }
    }
    
    function reposition(container, src) {
        var minContainerWidth = $(src).outerWidth() + 75;
        var maxContainerWidth = minContainerWidth;

        //minContainerWidth += 75;
        
        if (requiresFixedWidth) {
            if ($(container).width() <= minContainerWidth)
                $(container).css('width', minContainerWidth);
            else
                $(container).css('width', maxContainerWidth);
        } 
        else {
            $(container).css('min-width', minContainerWidth + 'px');
            $(container).css('max-width', maxContainerWidth + 'px');
        }
        var newTop = $(src).offset().top + $(src).outerHeight();
        var newLeft = $(src).offset().left + $(src).outerWidth() - $(container).width();
        
        $(container).css("top", newTop + "px");
        $(container).css("left", newLeft + "px");
        $(container).removeClass('hidden');
    }
    
    function navBarSearchStart() {
        $('#SearchGo').addClass('icoActive');
    }
    
    function navBarSearchEnd() {
        $('#SearchGo').removeClass('icoActive');
    }
    
    $('.search_results').delegate('li:not(li.search-results-info)', 'click', function() {
        window.location = "/managefolder.aspx?id=" + $(this).attr('data-id');
    });
});

$.fn.extend({
    instantSearch: function(responseHandler, options, searchBegin, searchEnd) {
        options = $.extend({}, $.InstantSearch.defaults, {}, options);
        
        return this.each(function() {
            new $.InstantSearch(this, options, responseHandler, searchBegin, searchEnd);
        });
    },
    standardSearch: function(query, hiddenInput, form) {
        return this.each(function() {
            $(this).click(function() {
                $(hiddenInput).val($(this).attr('data-searchtype'));
                if ($(query).val() == $(query).attr('data-default')) {
                    $(query).val('');
                }
                $(form).submit();
                return false;
            });
        });
    },
    updateSearchType: function(handler) {
        return this.trigger("updateSearchType", [handler]);
    },
    updateSearchResults: function() {
        return this.trigger("updateSearchResults");
    }
});

$.InstantSearch = function(src, options, searchResultsCallback, searchBegin, searchEnd) {
    var $input = $(src).attr("autocomplete", "off");
    
    var previousValue = "", 
    previousSearchStartTime, 
    delay = options.delay, 
    searching = false, 
    searchPending = false, 
    pendingQuery = '';
    
    var searchSource = $input.attr('data-searchsource');
    
    var $results = $('.' + options.resultsClass);
    
    if (typeof options.button !== 'undefined') {
        $($(options.button)).bind('click', function(e) {
            if ($input.val().trim().length > 0 || isAdvancedSearch()) {
                trySearch($input, true);
            } 
            else
                $input.focus();
            e.preventDefault();
            return false;
        });
    }
    
    $input.bind(keyEventToListen, function(event) {
        if (!options.disableEnterKey && event.keyCode == 13) {
            if (searching) {
                e.stopImmediatePropagation();
                e.stopPropagation();
                return false;
            } 
            else {
                trySearch($input, true);
            }
        } 
        else if (options.instantSearchEnabled && event.keyCode != 13) {
            pendingQuery = $input.val();
            setTimeout(function() {
                if (pendingQuery == $input.val()) {
                    trySearch($input, options.forceSearch);
                }
            }, options.delay);
        }
    });
    
    $input.bind('updateSearchType', function() {
        options.searchType = arguments[1];
    });
    
    function updateSearchResults() {
        trySearch($input, true);
    }
    
    function trySearch(src, force) {
        var searchQuery = $.trim($(src).val());
        
        var currentTimestamp = new Date().getTime();
        var timing = (currentTimestamp - previousSearchStartTime) > options.delay;
        var hasWildCardCharacters = textSearchOverride(searchQuery);
        if (hasWildCardCharacters)
            force = true;
        var lengthRequirementMet = searchQuery.length >= options.minChars || hasWildCardCharacters;
        var diffQueries = searchQuery != previousValue;
        var hasMatchedQuotes = ((searchQuery.split('"').length - 1) % 2 == 0);
        var canSearch = lengthRequirementMet && diffQueries && hasMatchedQuotes && !searching;
        
        if (force && hasMatchedQuotes)
            canSearch = true;
        
        var queryParameters = buildSearchQuery(searchQuery, searchSource, isAdvancedSearch());
        var queryAsString = JSON.stringify(queryParameters);
        
        if (!options.ignoreCache && !force && searchResultsInCache(queryAsString)) {
            if (typeof searchBegin == 'function')
                searchBegin();
            searchResultsCallback($.InstantSearch.cache[queryAsString].Response, $('.' + options.resultsClass), $input, {fromCache: true,key: queryAsString}, isAdvancedSearch());
            if (typeof searchEnd == 'function')
                setTimeout(function() {
                    searchEnd();
                }, 250);
        } 
        else if (canSearch) {
            if (($(src).val() != previousValue && !searching) || isAdvancedSearch()) {
                searching = true;
                doSearch(queryParameters, queryAsString);
                previousValue = searchQuery;
            }
        } 
        else {
            if (options.resultsAsModal && !lengthRequirementMet)
                $results.addClass('hidden');
        }
    }
    
    function doSearch(queryParameters, queryAsString) {
        if (typeof searchBegin == 'function')
            searchBegin();
        
        if ($.InstantSearch.cache[queryAsString] != null)
            $.InstantSearch.cache[queryAsString] = null;
        
        var data = JSON.stringify({query: queryParameters});
        
        executeQuery('InstantSearch', data, function(resp) {
            if (resp && resp.ResultType == 'content') {
                searchResultsCallback(resp, $('.' + options.resultsClass), $input, {fromCache: false,key: queryAsString}, isAdvancedSearch());
            }
            searching = false;
            
            if (typeof searchEnd == 'function')
                searchEnd();
        });
        
        bindToClick();
    }
    
    function searchResultsInCache(query) {
        var currTime = new Date().getTime();
        return $.InstantSearch.cache[query] != null && $.InstantSearch.cache[query] != 'undefined' && (currTime - $.InstantSearch.cache[query].Timestamp <= options.cacheLifetime);
    }
    
    function bindToClick() {
        if (options.resultsAsModal)
            $('body').bind('click', hideResultsIfNeeded).bind(keyEventToListen, hideResultsIfNeeded);
    }
    
    function hideResultsIfNeeded(event) {
        if (!$results.hasClass('hidden')) {
            if (event.keyCode == '27') {
                $('body').unbind('click', hideResultsIfNeeded).unbind(keyEventToListen, hideResultsIfNeeded);
                $results.addClass('hidden');
            } 
            else if (event.type == 'click') {
                var x, y, width, height;
                height = $results.outerHeight();
                width = $results.outerWidth();
                x = $results.position().left;
                y = $results.position().top;
                
                var x_end = x + width;
                var y_end = y + height;
                
                var containerClicked = elementClick(event, $results) || $(event.target).attr('id') == $input.attr('id');
                
                if (!containerClicked) {
                    $('body').unbind('click', hideResultsIfNeeded).unbind(keyEventToListen, hideResultsIfNeeded);
                    $results.addClass('hidden');
                }
            }
        }
        return true;
    }
    
    function elementClick(event, ele) {
        var $ele = $(ele);
        var x, y, width, height;
        height = $ele.outerHeight();
        width = $ele.outerWidth();
        x = $ele.position().left;
        y = $ele.position().top;
        
        var x_end = x + width;
        var y_end = y + height;
        
        return (event.clientX >= x && event.clientX <= x_end) && (event.clientY >= y && event.clientY <= y_end);
    }
    
    function executeQuery(op, query, callback) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            url: options.webserviceURL + op,
            data: query,
            dataType: "json",
            success: function(result) {
                callback(result);
            }
        });
    }
    
    function textSearchOverride(val) {
        return val.indexOf('*') > 1 || val.indexOf('?') > 0;
    }
    
    function isAdvancedSearch() {
        return options.searchType == 'advanced';
    }
}

$.InstantSearch.defaults = {
    searchType: 'basic',
    resultsClass: 'search_results',
    loadingClass: 'search_loading',
    resultItemClass: 'search_results_item',
    searchButtonClass: 'search_button',
    minChars: 2,
    delay: 250,
    forceSearch: false,
    width: '300px',
    webserviceURL: 'webservices/AjaxUtils.asmx/',
    instantEnabled: true,
    disableEnterKey: false,
    resultsAsModal: false,
    ignoreCache: false,
    cacheLifetime: 300000
};

$.InstantSearch.cache = [];

function buildSearchQuery(term, src, isAdvanced) {
    if (src == 'SearchBar') {
        return {
            Source: 'SearchBar',
            SearchTerm: term
        };
    } 
    else {
        var itemType = $(itemTypeID).val() == 'All' ? '' : $(itemTypeID).val();
        var query = {
            Source: 'SearchPage',
            SearchTerm: term,
            CreatorID: $(uploadedByID).val(),
            ParentID: $(copyToID).val(),
            SearchStartDateText: $(startDateID).val(),
            SearchStartDateEnd: $(endDateID).val(),
            DateRange: $(dateRangeId).val(),
            ItemType: itemType,
            ItemNameOnly: $(itemNameOnly).prop('checked')
        };
        
        if (!isAdvanced) {
            query.CreatorID = '';
            query.ParentID = '';
            query.SearchStartDateText = '';
            query.SearchStartDateEnd = '';
            query.DateRange = '';
            ItemType = '';
            ItemNameOnly = false;
        }
    }
    return query;
}
