"use strict";

// code based on https://github.com/mdn/webextensions-examples/tree/master/user-agent-rewriter
const uaStrings = {
  "Firefox": "",
  "Chrome": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
  "IE 11": "Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0;  rv:11.0) like Gecko",
  "IE 10": "Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)",
  "IE 9": "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; Trident/5.0)",
  "IE 8": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1)",
  "IE 7": "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1)",
  "IE 6": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0; WOW64; Trident/4.0; SLCC1)",
  "iPhone": "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25",
  "iPad": "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25",
}

let uaMapping =  {};

function getReadableUAforAll(){
	return getReadableUAforDomain("all");
}
function getReadableUAforDomain(domain){
	return uaMapping[domain] || "";
}
function getUAforAll(){
	return getUAforDomain("all");
}
function getUAforDomain(domain){
	return uaStrings[getReadableUAforDomain(domain)] || "";
}

function deleteMapping(domain){
	delete(uaMapping[domain]);
	saveMappings();
}
function addMapping(domain, uaReadable){
	uaMapping[domain] = uaReadable;
	saveMappings();
}

function saveMappings(){
	browser.storage.local.set({'mappings': JSON.stringify(uaMapping)});
}
function loadMappings(){
	let storageItem = browser.storage.local.get('mappings');
	storageItem.then((res,err) => {
		try{
			uaMapping = JSON.parse(res.mappings);
		}
		catch(errTry){
		}
	});  
}

function getDomainFromUrl(url){
	return new URL(url).host;
}

function rewriteUserAgentHeader(e) {
	const domain = getDomainFromUrl(e.url);
	const ua_for_all = getUAforAll();
	const ua_for_domain = getUAforDomain(domain)
	const ua_to_use = ua_for_domain || ua_for_all;
	if(ua_to_use){
		for (var header of e.requestHeaders) {
			if (header.name.toLowerCase() === "user-agent") {
				header.value = ua_to_use;
			}
		}
	}
	return {requestHeaders: e.requestHeaders};
}

browser.webRequest.onBeforeSendHeaders.addListener(rewriteUserAgentHeader,
                                                   {urls: ["<all_urls>"]},
                                                   ["blocking", "requestHeaders"]);

loadMappings();