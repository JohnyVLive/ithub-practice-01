// Алгоритм:
// На сервере хранится список ключевых слов, которым соответствует несколько URL.
// Клиент посылает ключевое слово на сервер.
// Сервер передаёт клиенту список URL.
// Клиент выбирает один URL из списка и через сервер в многопоточном режиме скачивает контент.
// Клиент сохраняет контент в LocalStorage с возможностью чтения оффлайн.
//
//
// Сервер должен:
// Хранить соответствие ключевых слов с URLами.
// При скачивании контента передавать статус загрузки: размер, кол-во запущенных потоков, прогресс загрузки.
// Кол-во потоков и скорость на поток должно быть ограничено посредством конфига.
//
//
// Клиент должен:
// Иметь поле для ввода ключевого слова.
// Иметь возможность показа списка URL с возможностью выбора пользователем нужного.
// Показывать статус загрузки: размер, кол-во запущенных потоков, прогресс загрузки.
// Иметь возможность показа списка загруженного контента с возможностью выбора пользователем нужного.
// Показать выбранный загруженный контент.
//
// Не забудьте отследить все возможные ошибки, обработав их и представив пользователю в удобном виде.

// TODO: Реализовать подключения файла параметров для указания путей до ресурсов

const port = 443
const resourcePath = './resources/'

import {WebSocketServer} from "ws"
import {Throttle, ThrottleGroup} from "stream-throttle";
import {v4 as uuid} from "uuid"
import {getResourceFilename, getURLS} from "./dictProc.js"
import {readFile, createReadStream, createWriteStream, statSync} from "fs"
const clients = {}



// const wss = new WebSocketServer({ port: port })
const wss = new WebSocketServer({port: port, path: "/wss"})

wss.on('connection', onConnect)
    console.log(`Сервер запущен на ${wss.options.port} порту`)

let tg = new ThrottleGroup({rate: 10240})

function onConnect(wsClient) {
    const clientId = uuid()
    console.log(`Новый пользователь: ${clientId}`)
    // wsClient.send('Привет');

    wsClient.on('close', function () {
        console.log(`Пользователь отключился: ${clientId}`)
    });

    wsClient.on('message', (message) => {
        // console.log(message);
        try {
            const jsonMessage = JSON.parse(message)

            switch (jsonMessage.action) {
                case 'GET_URLS':
                    console.log(`Получено сообщение: ${jsonMessage.data}`)
                    getURLS(jsonMessage.data).then(urls => {
                        if (urls.length > 0) {
                            wsClient.send(JSON.stringify({type: 'urlsInfo', urls}))

                        } else {
                            wsClient.send(JSON.stringify({type: 'message', data: 'empty'}))
                            console.log('Нет данных по такому слову')
                        }
                    })
                    break
                case 'GET_CONTENT':
                    //TODO Задать Потоки и скорость
                    //TODO При скачивании контента передавать статус загрузки: размер, кол-во запущенных потоков, прогресс загрузки
                    getContentInfo(jsonMessage.data).then(contentInfo => {
                        wsClient.send(JSON.stringify({type: 'contentInfo', data: contentInfo}))

                        const readStream = createReadStream(resourcePath + contentInfo.filename)
                        readStream.on('data', (chunk) => {
                            // console.log('----------')
                            // console.log(chunk)
                            wsClient.send(chunk, {binary: 'true'})
                        })
                        readStream.on('end', () => {
                            wsClient.send(JSON.stringify({type: 'file'}))
                            console.log('Передача файла завершена')
                        })

                    }).catch(error => {
                        //TODO Отправить ошибку клиенту при отксутствии информации о контенте
                        wsClient.send(JSON.stringify({type: 'error', data: 'empty'}))
                    })

                    break
                default:
                    wsClient.send(JSON.stringify('empty'))
                    console.log('Неизвестная команда или запрос')
                    break
            }
        } catch (error) {
            console.log('Ошибка', error)
        }
    })

}

async function getContentInfo(id) {
    console.log(`Запрошен контент с id ${id}`)
    let data = {}
    data.id = id
    data.filename = getResourceFilename(id)
    data.fileSize = statSync(resourcePath + data.filename).size
    const fileSegments = data.filename.split('.')
    data.fileExt = fileSegments[fileSegments.length - 1]
    return data
}


// async function sendFile(filename){
//     const file = 'resourcePath + filename'
//     const fileExt = filename.split('.')[-1]
//     const fileData = {
//         'filename': filename,
//         'size': 1000,
//         'fileExt': fileExt
//
//     }
//     return fileData
// }

//download file to server's storage from WEB

// async function downloadFromWeb(url, clientId){
//
//     (await fs).promises.mkdir(tempFolder + '/' + clientId + '/', {recursive: true})
//
//     const urlSegments = url.split('/')
//     const filename = tempFolder + '/' + clientId + '/' +urlSegments[urlSegments.length - 1]
//     const fileStream = (await fs).createWriteStream(filename)
//
//     const req = (await http).get(url, (res) => {
//         res.pipe(fileStream)
//         fileStream.on('finish', () => {
//             fileStream.close()
//             console.log('Файл загружен на сервер')
//         })
//     })
// }

// async function deleteFileFromServer(clientId){
//     const folder = tempFolder + '/' + clientId + '/';
//     (await fs).readdir(folder, (err, fs) => {
//         if(!err){
//             await fs.rmSync(folder, {recursive: true, force: true})
//             console.log('Файлы пользователья с сервера удалены')
//         }
//     })
// }





