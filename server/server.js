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

import {WebSocketServer} from "ws"
import {v4 as uuid} from "uuid"
import {getResourceURL, getURLS} from "./dictProc.js"
import {readFile} from "fs"
const clients = {}
const resourcePath = './resources/'

const port = 8080
const wss = new WebSocketServer({ port: port })

wss.on('connection', onConnect);
    console.log(`Сервер запущен на ${port} порту`)

function onConnect(wsClient) {
    const clientId = uuid()
    console.log(`Новый пользователь: ${clientId}`)
    // wsClient.send('Привет');

    wsClient.on('close', function() {
        console.log(`Пользователь отключился: ${clientId}`)
    });

    wsClient.on('message', (message) => {
        // console.log(message);
        try {
            const jsonMessage = JSON.parse(message)

            switch (jsonMessage.action) {
                case 'ECHO':
                    wsClient.send(jsonMessage.data)
                    break
                case 'PING':
                    setTimeout(function() {
                        wsClient.send('PONG')
                    }, 2000)
                    break
                case 'GET_URLS':
                    console.log(`Получено сообщение: ${jsonMessage.data}`)
                    getURLS(jsonMessage.data).then(urls => {
                        if (urls.length > 0) {
                            wsClient.send(JSON.stringify(urls))
                        } else {
                            wsClient.send(JSON.stringify('empty'))
                            console.log('Нет данных по такому слову')
                        }
                    })
                    break
                case 'GET_CONTENT':
                    console.log(`Запросил файл с id ссылки ${jsonMessage.data}`)

                    // TODO Определить расширение ресурса
                    // TODO Задать Потоки и скорость
                    getResourceURL(jsonMessage.data).then(filename => {
                        console.log(filename)
                        // Отправляем ресурс, если существует. Если не существует, отправляем сообщение с ошибкой
                        readFile(resourcePath + filename, (err,data) => {
                            // wsClient.send(JSON.stringify('fileProc'))
                            if (err) {
                                wsClient.send(JSON.stringify(err.code))
                            }
                            else wsClient.send(data, {binary: true})
                        })
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


async function sendContent(url){
        console.log(`Запрошен контент с id ${url.id}`)
}



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





