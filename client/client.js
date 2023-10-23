const wsURL = 'ws://localhost:8080'
const clientURL = window.location.href
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
        switch (myWs.readyState){
            case 3:
                onError('Ошибка подключения к серверу')
                break
            default:
                onError('Какая-то другая ошибка')
                break
        }
    }
}
function onOpen(){
    console.log('подключился')
}
function onError(evt) {
    //TODO убрать вывод в консоль
    console.log(evt)
    writeMessage('<span style = "color: red;">ERROR:</span> ' + evt);
}
window.addEventListener("load", init, false);

async function onMessage(message){
    if (typeof(message.data) === 'object'){
        console.log('Файлик летит')
        const jpegBlob = new Blob([message.data],{type:"application/jpeg"});
        const url = webkitURL.createObjectURL(jpegBlob);
        window.open(url);
    } else {
        const data = JSON.parse(message.data)

        // setTimeout( () => {
        //     divContainer.removeChild(divContainer.firstChild)
        // },1000)
        divContainer.innerHTML = ''
        if (data === 'empty') {
            writeMessage('Нет данных по такому слову. Попробуйте ещё раз.')
        } else if (data === 'ENOENT'){
            writeMessage('Файл на сервере не найден.')
        } else if (data) {
            // console.log(data)
            data.forEach((url) => {
                const divUrl = document.createElement('div')
                divUrl.id = url.id
                divUrl.style.marginTop = '15px'

                //TODO Заменить ссылки на что-то другое
                const pUrl = document.createElement('p')
                pUrl.innerHTML = clientURL + url.link
                // aUrl.setAttribute('target', '_blank')
                // aUrl.href = url.link
                // aUrl.innerHTML = `Контент номер ${i}`
                divUrl.appendChild(pUrl)

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

                // Обработка нажатия кнопки
                buttonDownload.addEventListener('click', () => {
                    getContent(url)
                })
            })
        }
    }
}

function wsSendEcho(value) {
    myWs.send(JSON.stringify({action: 'ECHO', data: value.toString()}))
}

function wsSendPing() {
    myWs.send(JSON.stringify({action: 'PING'}))
}

// Функция вывода сообщение для пользователей
function writeMessage(message) {
    const div = document.createElement('div')
    div.innerHTML = message
    div.id = "message"
    divContainer.appendChild(div)
}

function getResources(word) {
    try {
        myWs.send(JSON.stringify({action: 'GET_URLS', data: word.toString()}))
    } catch (e) {
        console.log(e)
    }

}

// Отправляем запрос ключевого слова на сервер
const form = document.forms.namedItem("form-request")
form.addEventListener("submit", function(e) {
    e.preventDefault()
    let user_request = form.elements.namedItem("user_request").value
    getResources(user_request)
})

//TODO Функция запроса файла
function getContent(url){
    console.log(`Скачиваем контент по ссылке с id ${url.id}`)
    try {
        myWs.send(JSON.stringify({action: 'GET_CONTENT', data: url.id.toString()}))
    } catch (e) {
        writeMessage(e)
    }

}