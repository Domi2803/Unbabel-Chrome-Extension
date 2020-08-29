setInterval(checkBalance, 10000);
fetchCredentials().then(()=>{checkBalance();});


var email;
var password;
var mode = false; // false: show tasks, true: show balance

function checkBalance(){
    getTabURL().then(url=>{
        mode = url.indexOf("unbabel.com") != -1;
    });
    var body = {"email": email, "password": password}
    fetch("https://mobile.unbabel.com/mapi/v1/login", {method: "post", headers: {"Content-Type": "application/json"},  body: JSON.stringify(body)})
    .then(res=>{
        
        if(res.status == 201)
            res.json().then((json=>{
                
                if(!mode)
                fetch("https://unbabel.com/editor/get_task_counts/", {method: "get", headers: {cookie: {"sessionid": json.api_key}}}).then(res=>res.json()).then(json=>{
                    chrome.browserAction.setBadgeText({text: json.paid.toString()});
                })
                else
                chrome.browserAction.setBadgeText({text: "$"+json.balance});
            }))
        else
        chrome.browserAction.setBadgeText({text: ""});
    })

    fetchCredentials();
}

function fetchCredentials(){
    return new Promise((res,rej)=>{
        chrome.storage.sync.get('email', data=>{
            email = data.email;
            chrome.storage.sync.get('password', data=>{
                password = data.password;
                
            });
        });
    })
}

function getTabURL(){
    return new Promise((res, rej)=>{
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            // and use that tab to fill in out title and url
            var tab = tabs[0];
            res(tab.url);
        });
    });
}


