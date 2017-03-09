/*****************************************************************
Author: Levi Smith
Version: 1.0

The purpose of this extension is to be able to quickly take the tab 
that your are on for our brands or AEM pages and open up a new tab 
with the corresponding sitepage or AEM page.

*****************************************************************/

// Build a list of AEM Sites with their top node URL name and their domain
// List of all AEM sites with their corresponding AEM acronym and domain
const sites = [ { site: 'example', domain: 'example.com' },
                { site: 'blah', domain: 'blah.net' }];



// Replace with your support e-mail and your base AEM url
const config = {
  email: "blah@email.com",
  aemUrl: "aem.example.net"
};

// Take the URL and parse it out for use in searching for the 
// corresponding site page/aem page
function extractDomain(url) {


    var domain;
    var site;
    var brand;
    var page = "";

    // Find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    // Find & remove www. only if it's at the beginning of the URL
    if(domain.substring(0,4) === "www.") {
      domain = domain.split("www.")[1];
    }

    // Determines the function to call to based on if AEM or sitepage is the referrer
    if(domain === config.aemUrl) {
      // Gets the acronym from AEM that comes after content/ in the URL
      site = url.substr(url.indexOf("content/") + 8, url.length);
      brand = site.split("/")[0];

      // Get the path from the URL after the brand acronym
      page = site.substr(site.indexOf(brand) + brand.length, site.length);
      launchWebsite(brand,page);

    } else {
      // Gets the path of the URL after the domain
      page = url.substr(url.indexOf(domain) + domain.length, url.length);
      launchAEMPage(domain, page);
    }
}

// Builds the URL and launches the corresponding website
// Takes two parameters:
// brand - this is the AEM top node url name
// page - this is the URL path after the domain (/index.html)
function launchWebsite(brand, page) {

  var pg = sites.find(x => x.site === brand);  

  if(!pg) {
    return alert(`Website could not be launched \nPlease Contact ${config.email} to report this bug`);
  }

  var newPage = "http://" + pg.domain + "/" + page;
  window.open(newPage, '_blank');
}

// Builds the URL and launches the corresponding aem page
// Takes two parameters:
// brand - this is the brand acronym as used in AEM
// page - this is the URL path after the domain (/index.html)
function launchAEMPage(brand, page) {
  
  var pg = sites.find(x => x.domain === brand);

  if(!pg) {
    return alert(`AEM page could not be launched \nPlease Contact ${config.email} to report this bug`);
  }

  var newPage = "https://" + config.aemUrl + "/cf#/content/" + pg.site + page;
  window.open(newPage, '_blank');
}


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

// Get the URL of the current active tab
chrome.browserAction.onClicked.addListener(function(e) {
    getCurrentTabUrl(function(url) {
      extractDomain(url);
    });
});



