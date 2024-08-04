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

export async function getP2PTransactions(days) {
  const endpoint = '/sapi/v1/c2c/orderMatch/listUserOrderHistory';
  const timestamp = Date.now();

  const oneYearInMillis = days * 24 * 60 * 60 * 1000;
  const startTime = timestamp - oneYearInMillis;
  
  const params = {
    timestamp,
    startTime,
    endTime:timestamp,
  };
  const queryString = new URLSearchParams(params).toString();

  const signature = sign(queryString, SECRET_KEY);
  const url = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-MBX-APIKEY': API_KEY
      }
    });
    return response.data.data.filter(item => item.createTime >= startTime);
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
