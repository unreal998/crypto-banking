import axios from 'axios';
import {createHmac} from 'crypto';

const API_KEY = 'CGAEE0s8fUqr8kGjquUJ5IGJXRcHeZN2l0ExuBog78KBTHg9oYb8a7rY4jKqGXlP';
const SECRET_KEY = 'YoBwFi2Co1Fsho5gatrvtjHCJNbBauRhZ1UyUSVzHVKg9BXSp3GxKUeSPdWx24jd';

// const API_KEY = 'cGPc6FIagwVHds2odKAl3ScEDCrI4BJG3UTTRuF4Rz9PWlDauqpEkSiKQPZJRsQD';
// const SECRET_KEY = 'ZVRI7FPWkcfhWW4ZMEz6pjy7NywDY3jj3W19SuHJ1H9Y6POh6pPBYGH6NxbtYnFZ';
const BASE_URL = 'https://api.binance.com';

// Функция для подписи запроса
function sign(queryString, secretKey) {
  return createHmac('sha256', secretKey).update(queryString).digest('hex');
}

// Функция для отправки запроса к API Binance
async function binanceRequest(endpoint, params) {
  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString, SECRET_KEY);
  const url = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error making request to Binance API:', error.response ? error.response.data : error.message);
  }
}

async function getBinanceTotalData(days) {
  const endpoint = '/sapi/v1/c2c/orderMatch/listUserOrderHistory';
  const timestamp = Date.now();
  const oneYearInMillis = days * 24 * 60 * 60 * 1000;
  const startTime = timestamp - oneYearInMillis;

  const totalData = {
    total: 0,
    data: []
  }
  const params = {
    timestamp,
    startTime: timestamp,
    endTime: startTime,
    recvWindow: 60000
  };
  const queryString = new URLSearchParams(params).toString();

  const signature = sign(queryString, SECRET_KEY);
  const url = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;
  const response = await axios.get(url, {
    headers: {
      'X-MBX-APIKEY': API_KEY
    }
  });
  const totalPages = Math.ceil(response.data.total / 50);
  totalData.total = response.data.total;
  totalData.data = [...response.data.data];
  for (let i = 2; i < totalPages; i++) {
    const timestamp = Date.now();
    const params = {
      timestamp,
      startTime: timestamp,
      endTime: startTime,
      page: i,
    };
    const queryString = new URLSearchParams(params).toString();
  
    const signature = sign(queryString, SECRET_KEY);
    const url = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;
    const response = await axios.get(url, {
      headers: {
        'X-MBX-APIKEY': API_KEY
      }
    });
    totalData.data = [...totalData.data, ...response.data.data];
  }
  return totalData
}

export async function getP2PTransactions(days, page) {
  const timestamp = Date.now();
  const oneYearInMillis = days * 24 * 60 * 60 * 1000;
  const startTime = timestamp - oneYearInMillis;
  try {

    const totalData = await getBinanceTotalData(days);
    const items = totalData.data.filter(item => item.createTime >= startTime && item.orderStatus === 'COMPLETED')
    const pageItems = [];

    let buyCourse = 0;
    let soldCourse = 0;
    let buyTotal = 0;
    let soldTotal = 0;
    let buyCount = 0;
    let soldCount = 0;

    items.forEach((item, index) => {
      if (index <= page * 50 && index > (page * 50) - 50) {
        if (item.createTime >= startTime) {
          pageItems.push(item);
        }
      }
      if (item.tradeType === 'SELL' ) {
        if (item.fiat === 'UAH') {
          soldTotal += (+item.amount)
          soldCourse += (+item.unitPrice);
          soldCount += 1;
        }
      } else {
        if (item.fiat === 'UAH') {
          buyTotal += (+item.amount);
          buyCourse += (+item.unitPrice);
          buyCount += 1;
        }
      }

    })
    soldCourse = soldCount > 0 ? (soldCourse / soldCount).toFixed(4) : 0;
    buyCourse = buyCourse > 0 ? (buyCourse / buyCount).toFixed(4) : 0;
    buyTotal = buyTotal.toFixed(4);
    soldTotal = soldTotal.toFixed(4);
    const responceData = {
      total: items.length,
      data: pageItems,
      buyCourse,
      soldCourse,
      buyTotal,
      soldTotal,
    }
    return responceData;
  } catch (error) {
    console.error('Error fetching P2P transactions:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Функция для получения депозитов
export async function getDeposits(days) {
  const endpoint = '/sapi/v1/capital/deposit/hisrec';

  const oneYearInMillis = days * 24 * 60 * 60 * 1000;
  const endTime = Date.now();
  const startTime = endTime - oneYearInMillis;

  const params = {
    timestamp: Date.now(),
    startTime,
    endTime,
  };
  const deposits = await binanceRequest(endpoint, params);
  return deposits;
}

// Функция для получения выводов
export async function getWithdrawals(days) {
  const endpoint = '/sapi/v1/capital/withdraw/history';

  const oneYearInMillis = days * 24 * 60 * 60 * 1000;
  const endTime = Date.now();
  const startTime = endTime - oneYearInMillis;

  const params = {
    timestamp: Date.now(),
    coin: "USDT",
    startTime,
    endTime,
  };
  const withdrawals = await binanceRequest(endpoint, params);
  return withdrawals;
}
