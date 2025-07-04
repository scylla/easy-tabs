/*
  generate tabs UI
*/

var activeTabDomains = {};
var activeWindows = {};
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
    var palette = [
        '#4b0082',
        '#8a2be2',
        '#9370db',
        '#9400d3',
        '#006400',
        '#2e8b57',
        '#3cb371',
        '#66cdaa'
    ];
    var hash = 0;
    for (var i = 0; i < domain.length; i++) {
        hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    var index = Math.abs(hash) % palette.length;
    return palette[index];
}

function lightenColor(color, percent) {
    var num = parseInt(color.replace('#', ''), 16);
    var amt = Math.round(2.55 * percent);
    var R = (num >> 16) + amt;
    var G = ((num >> 8) & 0x00ff) + amt;
    var B = (num & 0x0000ff) + amt;
    return (
        '#' +
        (
            0x1000000 +
            (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 0 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
    );
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

function addTopList(domainName, container) {
    var color = colorFromDomain(domainName);
    var colorLight = lightenColor(color, 30);
    var firstLetter = inverseDomainMap[domainName].charAt(0).toUpperCase();
    var angle = Math.floor(Math.random() * 360);
    $(container).append(
        '<div class="panel panel-default" id="panel-' +
            domainName +
            '"><div class="panel-heading" style="background: linear-gradient(' +
            angle +
            'deg, ' +
            color +
            ', ' +
            colorLight +
            ');color:#fff;" role="tab" id="heading-' +
            domainName +
            '"><h4 class="panel-title"><span class="domain-icon" style="background: linear-gradient(' +
            angle +
            'deg, ' +
            colorLight +
            ', ' +
            color +
            ');">' +
            firstLetter +
            '</span> ' +
            inverseDomainMap[domainName] +
            '</h4></div></div>'
    );
}

function addSubLists(tabObject, container) {
    var subListID = 'collapse-' + tabObject.tabID;
    $(container)
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
function generateTabsUI(container) {
    for (var domainName in activeTabDomains) {
        var domainsList = activeTabDomains[domainName];
        addTopList(domainName, container);
        for (var it in domainsList) {
            addSubLists(domainsList[it], container);
        }
    }
}

// set all available domains within a container
function setDomainList(tabs, container) {
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
    generateTabsUI(container);
}

function addWindowContainer(windowId, index) {
    $('#accordion').append(
        '<div class="window-container" id="window-' +
            windowId +
            '"><h3 class="window-title">Window ' +
            index +
            '</h3><div class="window-domains" id="window-content-' +
            windowId +
            '"></div></div>'
    );
}

function setWindowList(windows) {
    for (var i = 0; i < windows.length; i++) {
        var win = windows[i];
        addWindowContainer(win.id, i + 1);
        // reset globals for each window
        activeTabDomains = {};
        numDomains = 0;
        domainMap = {};
        inverseDomainMap = {};
        setDomainList(win.tabs, '#window-content-' + win.id);
    }
}

if (typeof window !== 'undefined' && typeof chrome !== 'undefined') {
    $(document).ready(function() {
        chrome.windows.getAll({ populate: true }, setWindowList);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractDomain, sanitizeUrlForIcon };
}
