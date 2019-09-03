document.addEventListener("click", (e) => {
	if (!e.target.classList.contains("save")) {
		return;
	}
	const fd = new FormData(document.querySelector('form'));
	const ua = fd.get("ua");
	let domain = "all";

	if (["btnResetThisDomain","btnSaveThisDomain"].includes(e.target.id)){
		domain = fd.get("current_domain")
	}
	if (["btnSaveAll","btnSaveThisDomain"].includes(e.target.id)){
		backgroundPage.addMapping(domain, ua);
	}
	else if (["btnResetAll","btnResetThisDomain"].includes(e.target.id)){
		backgroundPage.deleteMapping(domain, ua);
	}
	displayUIDetails();
});

function getCurrentPage(callback){
	browser.tabs.query({active: true, currentWindow: true}).then(function(tabInfo){
		callback(tabInfo[0].url,tabInfo[0]);
	});
}

function displayUIDetails(){
	getCurrentPage(function(url,tabInfo){
		const domain = backgroundPage.getDomainFromUrl(url);
		const ua_domain = backgroundPage.getReadableUAforDomain(domain);
		const ua_all = backgroundPage.getReadableUAforAll();

		document.querySelector("#current_ua").innerText = ua_all;
		document.querySelector("#current_ua_this_domain").innerText = ua_domain;
		if(ua_all) document.querySelector(".ua_details.all").classList.remove("hide");
		if(ua_domain) document.querySelector(".ua_details.domain").classList.remove("hide");
		document.querySelector("input.current_domain").value = domain;

	})
}

const backgroundPage = browser.extension.getBackgroundPage();
displayUIDetails();