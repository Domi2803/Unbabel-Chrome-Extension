// init
fetchCredentials().then(()=>{update();});

// if user changes tab -> check for current tab url
chrome.tabs.onActiveChanged.addListener(checkTab);
chrome.tabs.onCreated.addListener(checkTab);
chrome.tabs.onUpdated.addListener(checkTab);

var email;
var password;
var isActive = false; // false: show tasks, true: show balance

var refreshTimeoutTask;

const activeRefreshTimeout = 15000; // if unbabel.com is opened, refresh every 15 seconds.
const inactiveRefreshTimeout = 60000; // if unbabel.com is closed, refresh every minute.

function update(){
    // reset timeout
    clearTimeout(refreshTimeoutTask);

    // login method - returns api_key, username and current balance
    var body = {"email": email, "password": password}
    fetch("https://mobile.unbabel.com/mapi/v1/login", {method: "post", headers: {"Content-Type": "application/json"},  body: JSON.stringify(body)})
    .then(res=>{
        
        // only continue if api call is successful.
        if(res.status == 201)
            res.json().then((json=>{
                
                if(!isActive)   // if unbabel.com isn't the active tab, make another request using the api_key to get the current number of available tasks
                fetch("https://mobile.unbabel.com/mapi/v1/available_tasks", {
                    method: "get", 
                    headers: {"Authorization": "ApiKey " + json.username + ":" + json.api_key}}) // auth-header used by api: Authorization: "ApiKey (username):(api key)"
                .then(res=>res.json()).then(json=>{
                    
                    // if you have multiple language pairs, sum up all of the task counts
                    var totalTasks = 0;
                    for(var i = 0; i < json.paid.length; i++){
                        totalTasks += json.paid[i].tasks_available;
                    }

                    // set badgetext to total number of tasks
                    chrome.browserAction.setBadgeText({text: totalTasks.toString()});
                })
                else // isActive == true -> user is currently on the unbabel website
                chrome.browserAction.setBadgeText({text: "$"+json.balance}); // set badgetext to current balance
            }))
        else // api call unsuccessful
        chrome.browserAction.setBadgeText({text: ""}); 
    })

    // depending on whether current tab is unbabel or not, update again in x seconds.
    const timeout = isActive ? activeRefreshTimeout : inactiveRefreshTimeout;
    refreshTimeoutTask = setTimeout(update, timeout);
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

// called on event hook, if user changes tab
function checkTab(){
    getActiveTabURL().then(url=>{
        var newIsActive = url.indexOf("unbabel.com") != -1; 
        if(newIsActive != isActive)
            update();
        isActive = newIsActive;
    });
}

// returns url of currently active tab
function getActiveTabURL(){
    return new Promise((res, rej)=>{
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function(tabs) {
            var tab = tabs[0];
            if(tab)
            res(tab.url);
            else
            res("");
        });
    });
}


