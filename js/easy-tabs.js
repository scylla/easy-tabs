/*
  generate tabs UI
*/

var activeTabDomains = {};
var domainRegex = /:\/\/(.[^/]+)/; // regex to get domains from URL
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

// on click visit-tab
$('#accordion').on('click', 'span.visit-tab', function() {
    chrome.tabs.update(parseInt($(this).attr('id')), { active: true, selected: true, highlighted: true });
});

// on click close-tab
$('#accordion').on('click', 'span.close-tab', function() {
    chrome.tabs.remove([parseInt($(this).attr('id'))]);
    $(this).parent().parent().remove();
});

function addTopList(domainName) {
    $('#accordion').append('<div class="panel panel-default" id="panel-' + domainName + '"><div class="panel-heading" role="tab" id="heading-' + domainName + '"><h4 class="panel-title">' + inverseDomainMap[domainName] + '</h4></div></div>');
}

function addSubLists(tabObject) {
    $('#accordion').find('#panel-' + tabObject.tabDomain).append('<div id="collapse-' + tabObject.tabDomain + '" role="tabpanel" class="data-item" aria-labelledby="heading-' + tabObject.tabDomain + '"><div class="panel-body"><span class="visit-tab" id="' + tabObject.tabID + '">' + tabObject.tabTitle + '</span> &nbsp; <span class="glyphicon glyphicon-remove close-tab" aria-hidden="true" id="' + tabObject.tabID + '"></span></div></div>');
}

// function generate tabs UI
function generateTabsUI() {
    for (var domainName in activeTabDomains) {
        var domainsList = activeTabDomains[domainName];
        addTopList(domainName);
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
        var tabDomain = tabUrl.match(domainRegex)[1];
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

$(document).ready(function() {
    chrome.tabs.getAllInWindow(null, setDomainList);
});
