import express, { json, urlencoded } from 'express';
import cors from 'cors';
import http from 'http'
import { load } from 'cheerio';
import * as path from 'path';
import { readFileSync } from 'fs';
import { getDeposits, getWithdrawals, getP2PTransactions } from './binanceAPI.js';
import { getPortalList } from "./portalAPI.js";

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded());
app.set('trust proxy', true);

const __dirname = path.resolve();

app.get(/.css$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, '/src/html' + clientRequest.path));
})

app.get(/.js$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, '/src/html' + clientRequest.path));
})

app.get(/.svg$/, function(clientRequest, clientResponse) {
    clientResponse.sendFile(path.join(__dirname, '/src/html' + clientRequest.path));
})

app.get('/data', function(clientRequest, clientResponse) {
    const queyData = clientRequest.query;
    const binanceData = {
        withdrawals: [],
        deposites: []
    }
    getWithdrawals(queyData.days).then(data => {
        binanceData.withdrawals = data;
        getDeposits(queyData.days).then(data => {
            binanceData.deposites = data;
            clientResponse.send(binanceData);
        });
    });

});

app.get('/transfers', function(clientRequest, clientResponse){
    const queyData = clientRequest.query;
    getP2PTransactions(queyData.days, queyData.page).then(data => {
        clientResponse.send(data);
    });
});

app.get('/', function(clientRequest, clientResponse) {
    const htmlFile = readFileSync(__dirname + "/src/html/table.html", "utf-8");
    clientResponse.end(htmlFile);

});

app.get('/portalData', function(clientRequest, clientResponse) {
    const queyData = clientRequest.query;
    getPortalList(queyData.page, queyData.days).then(data => {
        clientResponse.send(data);
    });
})


const server = http.createServer(app);

export default server;
