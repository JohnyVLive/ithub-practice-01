const wsURL = 'ws://localhost:443/wss'
const clientURL = window.location.href
let myWs

let contentInfo = {}
let chunks = []
let buffer = new ArrayBuffer(contentInfo.fileSize)
let tempSize = 0

let divForm
let divRemote
let divLocal


function init() {
    localStorage.clear()
    divForm = document.getElementById('divForm')
    divRemote = document.getElementById('divRemote')
    divLocal = document.getElementById('divLocal')
    testWebSocket()
}
function testWebSocket() {
    myWs = new WebSocket(wsURL)
    myWs.binaryType = 'arraybuffer'
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
    writeMessage(divForm, '<span style = "color: red;">ERROR:</span> ' + evt);
}
window.addEventListener("load", init, false);


// Функция обновления статуса текущей загрузки
function drawDownloadStatus(id, loaded, total){
    const progressBar = document.getElementById('progress-' + id)
    const part = loaded * 100 / total
    const downloaded = total * progressBar.value / 100
    progressBar.value += part

    const divDownloadStatus = document.getElementById('statusId-' + id)
    if (divDownloadStatus){
        divDownloadStatus.innerHTML =
            `Потоки: 0000 , Скачано: ${(Math.round(downloaded/1024))} из ${Math.round(total/1024)} KB`
    } else {
        const divUrl = document.getElementById('contentRemoteId-' + id)
        const divDownloadStatus = document.createElement('div')
        divDownloadStatus.id = 'statusId-' + id
        divDownloadStatus.innerHTML =
            `Потоки: 0000 , Скачано: ${(Math.round(downloaded/1024))} из ${Math.round(total/1024)} KB`
        divUrl.appendChild(divDownloadStatus)
    }
}


async function onMessage(message){
    if (typeof(message.data) === 'object'){
        if (message.data.byteLength >= tempSize){
            chunks.push(message.data)
            tempSize = message.data.byteLength
            drawDownloadStatus(contentInfo.id, tempSize, contentInfo.fileSize)

        } else {
            chunks.push(message.data)
            tempSize = 0
            console.log('Загрузка завершена')
            //TODO Нужно написать функцию определения типа файла по расширению?
            const jpegFile = new File([new Blob(chunks)], contentInfo.filename, {type:"image/jpeg", lastModified: Date.now()})
            const url = webkitURL.createObjectURL(jpegFile)
            saveToLocalStorage(contentInfo.id, url)
            drawInLocalContainer(contentInfo.id)
        }

    } else {
        const data = JSON.parse(message.data)

        //TODO Может быть.. Добавить в каждое сообщение параметр type
        // message - сообщение для пользователя
        // error - ошибка
        // data - данные
        // urlsInfo - массив ссылок по ключевому слову
        // contentInfo - информация о передаваемом контекте
        // ..
        // и создавать действия под них
        console.log(`Тип запроса: ${data.type}`)

        switch (data.type){
            case 'message':
                clearPage(divRemote)
                switch (data.data){
                    case 'empty':
                        writeMessage(divRemote, 'Нет данных по такому слову. Попробуйте ещё раз.')
                        break
                }
                break
            case 'urlsInfo':
                clearPage(divRemote)
                drawRemoteContainer(data.urls)
                break
            case 'contentInfo':
                contentInfo = data.data
                break
            case 'file':
                console.log('Файл получен')
                chunks = []
                break
            case 'error':
                let resourceDiv = document.getElementById('contentRemoteId-'+data.id)
                switch (data.data){
                    case 'ENOENT':
                        console.log(resourceDiv.lastElementChild.id)
                        if (resourceDiv.lastElementChild.id === 'message')
                            clearPage(resourceDiv.lastElementChild)
                        writeMessage(resourceDiv, 'Файл на сервере не найден.')
                        break
                    default:
                        //TODO поправить вывод ошибок
                        writeMessage(resourceDiv, data.data)
                        console.log(data.data)
                }
                break
        }
    }
}

// Показать ресурсы на сервере по ключевому слову
function drawRemoteContainer(urls){

    urls.forEach((url) => {
        // Проверяем, есть ли контент в локальном хранилище. Если нет, показываем.
        if (!getFromLocalStorage(url.id)){
            const divUrl = document.createElement('div')
            divUrl.id = 'contentRemoteId-' + url.id
            divUrl.style.marginTop = '15px'

            const pUrl = document.createElement('p')
            pUrl.innerHTML = clientURL + url.link
            divUrl.appendChild(pUrl)

            const progressBar = document.createElement('progress')
            progressBar.id = 'progress-' + url.id
            progressBar.style.marginLeft = '15px'
            progressBar.style.marginRight = '15px'
            progressBar.value = 0
            progressBar.max = 100
            divUrl.appendChild(progressBar)
            const buttonDownload = document.createElement('button')
            buttonDownload.innerHTML = 'Скачать контент'
            divUrl.appendChild(buttonDownload)

            divRemote.appendChild(divUrl)

            // Обработка нажатия кнопки
            buttonDownload.addEventListener('click', () => {
                getContent(url)
            })
        }
    })
}

// Показать ресурсы в локальном хранилище
function drawInLocalContainer(id){
    const divUrl = document.createElement('div')
    divUrl.id = 'contentLocalId-' + id
    divUrl.style.marginTop = '15px'

    const pUrl = document.createElement('p')
    pUrl.innerHTML = clientURL + '&' + contentInfo.filename
    divUrl.appendChild(pUrl)

    const buttonShow = document.createElement('button')
    buttonShow.innerHTML = 'Посмотреть контент'
    divUrl.appendChild(buttonShow)

    divLocal.appendChild(divUrl)

    clearPage(document.getElementById('contentRemoteId-'+id))

    // Обработка нажатия кнопки
    buttonShow.addEventListener('click', () => {
        window.open(getFromLocalStorage(id))
    })
}

function saveToLocalStorage(id, data){
    localStorage.setItem('contentLocalId-' + id, data)
}

function getFromLocalStorage(id){
    const data = localStorage.getItem('contentLocalId-'+id)
    if (data)
        return data
}

function clearPage(container) {
    container.innerHTML = ''
}


// Функция вывода сообщения для пользователей
//TODO Можно сделать регулировку стиля взависимости от параметра. Пока все сообщения красные.
function writeMessage(container, message) {
    const div = document.createElement('div')
    div.style.color = 'red'
    div.innerHTML = message
    div.id = "message"
    container.appendChild(div)
}

function getResources(word) {
    try {
        myWs.send(JSON.stringify({action: 'GET_URLS', data: word.toString()}))
    } catch (e) {
        onError(e)
    }
}

// Отправляем запрос ключевого слова на сервер
const form = document.forms.namedItem("form-request")
form.addEventListener("submit", function(e) {
    e.preventDefault()
    let user_request = form.elements.namedItem("user_request").value
    getResources(user_request)
})

//Функция запроса файла
function getContent(url){
    try {
        myWs.send(JSON.stringify({action: 'GET_CONTENT', data: url.id.toString()}))
    } catch (e) {
        onError(e)
    }
}