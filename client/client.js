const wsURL = 'ws://localhost:8080'
let myWs
let divContainer

function init() {
    divContainer = document.getElementById('divContainer')
    testWebSocket()
}
function testWebSocket() {
    myWs = new WebSocket(wsURL)
    myWs.onopen = () => {
        onOpen()
    }
    myWs.onmessage = (message) => {
        onMessage(message)
    }
    //TODO Проверить обработку ошибок
    myWs.onerror = (evt) => {
        onError(evt)
    }
}
function onOpen(){
    console.log('подключился')
}
function onError(evt) {
    console.log(evt)
    writeMessage('<span style = "color: red;">ERROR:</span> ' + evt.data);
}
window.addEventListener("load", init, false);

async function onMessage(message){
    const data = JSON.parse(message.data)

    // setTimeout( () => {
    //     divContainer.removeChild(divContainer.firstChild)
    // },1000)
    divContainer.innerHTML = ''
    if (data === 'empty'){
        writeMessage('Нет данных по такому слову. Попробуйте ещё раз.')
    } else if (data){
        // console.log(data)
        let i = 1
        data.forEach( (url) => {
            const divUrl = document.createElement('div')
            divUrl.id = url.id
            divUrl.style.marginTop = '15px'

            //TODO Заменить ссылки на что-то другое
            const aUrl = document.createElement('a')
            aUrl.setAttribute('target', '_blank')
            aUrl.href = url.link
            aUrl.innerHTML = `Контент номер ${i}`
            divUrl.appendChild(aUrl)

            const progressBar = document.createElement('progress')
            progressBar.style.marginLeft = '15px'
            progressBar.style.marginRight = '15px'
            progressBar.value = 0
            progressBar.max = 100
            divUrl.appendChild(progressBar)

            const buttonDownload = document.createElement('button')
            buttonDownload.innerHTML = 'Скачать контент'
            divUrl.appendChild(buttonDownload)

            divContainer.appendChild(divUrl)
            i++
        })
    }
}

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

// Выводим сообщения для пользователей
function writeMessage(message) {
    const div = document.createElement('div')
    div.innerHTML = message
    div.id = "message"
    divContainer.appendChild(div)
}
