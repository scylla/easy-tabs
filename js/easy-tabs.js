/*
  generate tabs UI
*/

var activeTabDomains = {};
var domainRegex = /:\/\/(.[^/]+)/; // regex to get domains from URL

function sanitizeUrlForIcon(url) {
    if (!url) return url;
    try {
        var u = new URL(url);
        return u.origin === 'null' ? url.split('#')[0] : u.origin;
    } catch (e) {
        return url.split('#')[0];
    }
}

function colorFromDomain(domain) {
    var hash = 0;
    for (var i = 0; i < domain.length; i++) {
        hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var j = 0; j < 3; j++) {
        var value = (hash >> (j * 8)) & 0xff;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function extractDomain(url) {
    var match = url.match(domainRegex);
    return match ? match[1] : null;
}
var numDomains = 0;
var domainMap = {};
var inverseDomainMap = {};

// tab object description
var TabObject = function(tabDomain, tabUrl, tabTitle, tabID) {
    this.tabDomain = tabDomain;
    this.tabUrl = tabUrl;
    this.tabTitle = tabTitle;
    this.tabID = tabID;
}

// register events only when running in a browser environment
if (typeof window !== 'undefined' && typeof $ !== 'undefined') {
    // on click visit-tab
    $('#accordion').on('click', 'span.visit-tab', function() {
        chrome.tabs.update(parseInt($(this).attr('id')), { active: true });
    });

    // on click close-tab
    $('#accordion').on('click', 'span.close-tab', function() {
        var tabId = parseInt($(this).attr('id').replace('close-', ''));
        chrome.tabs.remove([tabId]);
        $(this).parent().parent().remove();
    });

    $('#searchBox').on('input', function() {
        var query = $(this).val().toLowerCase();
        $('#accordion .panel').each(function() {
            var text = $(this).find('.panel-title').text().toLowerCase();
            $(this).toggle(text.indexOf(query) !== -1);
        });
    });
}

function addTopList(domainName, iconUrl) {
    var color = colorFromDomain(domainName);
    $('#accordion').append(
        '<div class="panel panel-default" id="panel-' +
            domainName +
            '"><div class="panel-heading" style="background-color:' +
            color +
            ';color:#fff;" role="tab" id="heading-' +
            domainName +
            '"><h4 class="panel-title"><img class="domain-icon" src="chrome://favicon/' +
            iconUrl +
            '"> ' +
            inverseDomainMap[domainName] +
            '</h4></div></div>'
    );
}

function addSubLists(tabObject) {
    var subListID = 'collapse-' + tabObject.tabID;
    $('#accordion')
        .find('#panel-' + tabObject.tabDomain)
        .append(
            '<div id="' +
                subListID +
                '" role="tabpanel" class="data-item" aria-labelledby="heading-' +
                tabObject.tabDomain +
                '"><div class="panel-body"><span class="visit-tab" id="' +
                tabObject.tabID +
                '">' +
                tabObject.tabTitle +
                '</span> &nbsp; <span class="glyphicon glyphicon-remove close-tab" aria-hidden="true" id="close-' +
                tabObject.tabID +
                '"></span></div></div>'
        );
}

// function generate tabs UI
function generateTabsUI() {
    for (var domainName in activeTabDomains) {
        var domainsList = activeTabDomains[domainName];
        var icon = sanitizeUrlForIcon(domainsList[0].tabUrl);
        addTopList(domainName, icon);
        for (var it in domainsList) {
            addSubLists(domainsList[it]);
        }
    }
}

// set all available domains
function setDomainList(tabs) {
    // populte tabs list
    for (var i = 0; i < tabs.length; i++) {
        var tabUrl = tabs[i].url;
        var tabDomain = extractDomain(tabUrl);
        if (!tabDomain) {
            // skip tabs like about:blank
            continue;
        }
        if (tabDomain in domainMap) {
            tabDomain = domainMap[tabDomain];
        } else {
            domainMap[tabDomain] = "domainID" + numDomains;
            inverseDomainMap["domainID" + numDomains] = tabDomain;
            numDomains++;
            tabDomain = domainMap[tabDomain];
        }
        var tabTitle = tabs[i].title;
        var tabID = tabs[i].id;
        if (tabDomain in activeTabDomains) {
            activeTabDomains[tabDomain].push(new TabObject(tabDomain, tabUrl, tabTitle, tabID));
        } else {
            activeTabDomains[tabDomain] = new Array();
            activeTabDomains[tabDomain].push(new TabObject(tabDomain, tabUrl, tabTitle, tabID));
        }
    }
    generateTabsUI();
}

if (typeof window !== 'undefined' && typeof chrome !== 'undefined') {
    $(document).ready(function() {
        chrome.tabs.query({}, setDomainList);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractDomain, sanitizeUrlForIcon };
}
