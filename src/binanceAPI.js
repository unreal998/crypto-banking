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

async function getBinanceTotalData(from, to) {
  const endpoint = '/sapi/v1/c2c/orderMatch/listUserOrderHistory';
  const timestamp = Date.now();

  const totalData = {
    total: 0,
    data: []
  }
  const params = {
    timestamp,
    startTime: to,
    endTime: from,
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
      startTime: to,
      endTime: from,
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

export async function getP2PTransactions(page, from, to) {
  try {

    const totalData = await getBinanceTotalData(from);
    const items = totalData.data.filter(item => item.createTime >= from && item.orderStatus === 'COMPLETED')
    const pageItems = [];

    let buyCourse = 0;
    let soldCourse = 0;
    let buyTotal = 0;
    let soldTotal = 0;
    let buyCount = 0;
    let soldCount = 0;

    items.forEach((item, index) => {
      if (index <= page * 50 && index > (page * 50) - 51) {
        if (item.createTime >= from) {
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
