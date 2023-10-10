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

// import {URL_DICT} from "server/URL_DICT.js"
const dict = require('./dict')

const port = 8080
const WebSocket = require('ws')
// const URL_DICT = require("./URL_DICT");
const wsServer = new WebSocket.Server({ port: port })

wsServer.on('connection', onConnect);
console.log(`Сервер запущен на ${port} порту`);

function onConnect(wsClient) {
    console.log('Новый пользователь');
    wsClient.send('Привет');

    wsClient.on('close', function() {
        console.log('Пользователь отключился');
    });

    wsClient.on('message', function(message) {
        console.log(message);
        try {
            const jsonMessage = JSON.parse(message);

            switch (jsonMessage.action) {
                case 'ECHO':
                    wsClient.send(jsonMessage.data);
                    break;
                case 'PING':
                    setTimeout(function() {
                        wsClient.send('PONG');
                    }, 2000);
                    break;
                case 'SHOW_DICT':
                    const urls = dict.getURLS('Кот')
                    for (let url of urls){
                        wsClient.send(url)
                    }

                    // dict.getURLS('Котa')
                    break;
                default:
                    console.log('Неизвестная команда');
                    break;
            }
        } catch (error) {
            console.log('Ошибка', error);
        }
    });
}




