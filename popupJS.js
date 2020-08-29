function saveCreds(){
    messageSuccess.style.display = "none";
    messageFail.style.display = "none";

    var email = document.getElementById('emailField').value;
    var password = document.getElementById('passwordField').value;

    checkCredentials(email,password).then(isValid=>{
        if(!isValid){
            messageFail.style.display = "block";
            return;
        }
        messageSuccess.style.display = "block";
        chrome.storage.sync.set({email:email});
        chrome.storage.sync.set({password:password});
    
        var bgPage = chrome.extension.getBackgroundPage();
        bgPage.fetchCredentials();
    });

}

function openUnbabelInTab(){
    chrome.tabs.create({url: "https://unbabel.com/editor/dashboard"});
}

function checkCredentials(email, password){
    return new Promise((resolve,reject)=>{
        var body = {"email": email, "password": password}
        fetch("https://mobile.unbabel.com/mapi/v1/login", {method: "post", headers: {"Content-Type": "application/json"},  body: JSON.stringify(body)})
        .then(res=>res.json()).then(json=>{
            if(json.error == "unauthorized")
                resolve(false);
            resolve(true);
        })
    })
}


document.getElementById('saveButton').onclick = saveCreds;
document.getElementById('logo').onclick = openUnbabelInTab;

const messageSuccess = document.getElementById('messageSuccess');
const messageFail = document.getElementById('messageFail');