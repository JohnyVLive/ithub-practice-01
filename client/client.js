const myWs = new WebSocket('ws://localhost:8080');


myWs.onopen = function () {
    console.log('подключился');
};
myWs.onmessage = function (message) {
    console.log('Message: %s', message.data);
};


function wsSendEcho(value) {
    myWs.send(JSON.stringify({action: 'ECHO', data: value.toString()}));
}

function wsSendPing() {
    myWs.send(JSON.stringify({action: 'PING'}));
}

function wsDict() {
    myWs.send(JSON.stringify({action: 'SHOW_DICT'}));

    // for (let i of dict){
    //     console.log(i)
    // }
}


const form = document.forms.namedItem("form-request")
form.addEventListener("submit", function(e) {
    e.preventDefault();
    const completedFields = {}

    // for (let i = 0; i < form.elements.length; i++) {
    //     let el = form.elements[i];
    //     if (el.name) {
    //         completedFields[el.name] = false;
    //     }
    // }

    let user_request = form.elements.namedItem("user_request").value
    wsSendEcho(user_request)

})
