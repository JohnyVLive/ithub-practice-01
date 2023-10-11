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
import {getURLS} from "./dict.js"
const clients = {}

const port = 8080
const wss = new WebSocketServer({ port: port })

wss.on('connection', onConnect);
    console.log(`Сервер запущен на ${port} порту`)

function onConnect(wsClient) {
    const id = uuid()
    console.log(`Новый пользователь: ${id}`)
    // wsClient.send('Привет');

    wsClient.on('close', function() {
        console.log(`Пользователь отключился: ${id}`)
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
                case 'SHOW_DICT':
                    console.log(`Получено сообщение: ${jsonMessage.data}`)
                    const urls = getURLS(jsonMessage.data)
                    if (urls.length > 0) {
                        wsClient.send(JSON.stringify(urls))
                        break
                    } else {
                        wsClient.send(JSON.stringify('empty'))
                        console.log('Нет данных по такому слову')
                        break
                    }
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




