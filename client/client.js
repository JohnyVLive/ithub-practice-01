const myWs = new WebSocket('ws://localhost:8080')


myWs.onopen = async () => {
    await console.log('подключился')
};

myWs.onmessage = (message) => {
    console.log(JSON.parse(message.data))

    // if (typeof message.data == "object"){
    //     // for await (let elem of message.data){
    //     //     console.log(elem)
    //     // }
    //     console.log(JSON.parse(message.data))
    // } else {
    //     console.log('Message: %s', message.data)
    // }


    // const buffers = []
    // for await (const chunk of message){
    //     console.log(chunk)
    //     buffers.push(chunk)
    // }
    // const data = Buffer.concat(buffers)
    // console.log(data)

    // if (typeof message.data == "object"){
    //     console.log('it is an Object')
    //     for (let elem of message.data){
    //         console.log(elem)
    //     }
    // } else {
    //     console.log('Message: %s', message.data)
    // }
};


function wsSendEcho(value) {
    myWs.send(JSON.stringify({action: 'ECHO', data: value.toString()}))
}

function wsSendPing() {
    myWs.send(JSON.stringify({action: 'PING'}))
}

function wsDict(word) {
    myWs.send(JSON.stringify({action: 'SHOW_DICT', data: word.toString()}))
}

// Отправляем запрос ключевого слова на сервер
const form = document.forms.namedItem("form-request")
form.addEventListener("submit", function(e) {
    e.preventDefault()
    let user_request = form.elements.namedItem("user_request").value
    wsDict(user_request)
})
