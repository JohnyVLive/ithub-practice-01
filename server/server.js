// TODO: Реализовать подключения файла параметров для указания путей до ресурсов

const port = 443
const resourcePath = './resources/'

import {WebSocketServer} from "ws"
import {v4 as uuid} from "uuid"
import {getResourceFilename, getURLS} from "./dictProc.js"
import {createReadStream, statSync} from "fs"

const wss = new WebSocketServer({port: port, path: "/wss"})

wss.on('connection', onConnect)
console.log(`Сервер запущен на ${wss.options.port} порту`)


function onConnect(wsClient) {
    const clientId = uuid()
    console.log(`Новый пользователь: ${clientId}`)

    wsClient.on('close', function () {
        console.log(`Пользователь отключился: ${clientId}`)
    });

    wsClient.on('message', (message) => {
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

                        let readStream = createReadStream(resourcePath + contentInfo.filename)
                        readStream.on('readable', () => {
                            let buf
                            while ((buf = readStream.read()) !== null){
                                wsClient.send(buf, {binary: 'true'})
                            }
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
