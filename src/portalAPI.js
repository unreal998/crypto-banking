import axios from 'axios';

const PORTAL_URL = "https://v2.payportal.me/kek/invoices/new/list";
const SESSION_KEY = "eyJ1c2VyX2lkIjoxODB9.ZtbfsQ.3pFpcvsew2vQAhqVtpQs-U-JBek";

export async function getPortalList(page, from, to) {
    const timestamp = Date.now();

    const params = {
        draw: page,
        'columns[0][data]': 0,
        'columns[0][searchable]': true,
        'columns[0][orderable]': true,
        'columns[0][search][regex]': false,
        'columns[1][data]': 1,
        'columns[1][searchable]': true,
        'columns[1][orderable]': true,
        'columns[1][search][regex]': false,
        'columns[2][data]': 2,
        'columns[2][searchable]': true,
        'columns[2][orderable]': true,
        'columns[2][search][regex]': false,
        'columns[3][data]': 3,
        'columns[3][searchable]': true,
        'columns[3][orderable]': true,
        'columns[3][search][regex]': false,
        'columns[4][data]': 4,
        'columns[4][searchable]': true,
        'columns[4][orderable]': true,
        'columns[4][search][regex]': false,
        'columns[5][data]': 5,
        'columns[5][searchable]': true,
        'columns[5][orderable]': true,
        'columns[5][search][regex]': false,
        'columns[6][data]': 6,
        'columns[6][searchable]': true,
        'columns[6][orderable]': true,
        'columns[6][search][regex]': false,
        'columns[7][data]': 7,
        'columns[7][searchable]': true,
        'columns[7][orderable]': true,
        'columns[7][search][regex]': false,
        'columns[8][data]': 8,
        'columns[8][searchable]': true,
        'columns[8][orderable]': true,
        'columns[8][search][regex]': false,
        'columns[9][data]': 9,
        'columns[9][searchable]': true,
        'columns[9][orderable]': true,
        'columns[9][search][regex]': false,
        'columns[10][data]': 10,
        'columns[10][searchable]': true,
        'columns[10][orderable]': true,
        'columns[10][search][regex]': false,
        'columns[11][data]': 11,
        'columns[11][searchable]': true,
        'columns[11][orderable]': true,
        'columns[11][search][regex]': false,
        'columns[12][data]': 12,
        'columns[12][searchable]': true,
        'columns[12][orderable]': true,
        'columns[12][search][regex]': false,
        'order[0][column]': 0,
        'order[0][dir]': 'desc',
        start: (page-1) * 25,
        length: 25,
        'search[regex]': false,
        agent_id: 180,
        status: 10,
        _: timestamp,
        start_date: formatDate(from),
        finish_date: formatDate(to)
    }
    const queryString = new URLSearchParams(params);
    const responce = await axios.get(`${PORTAL_URL}?${queryString}`, {
        headers: {
            Cookie: `session=${SESSION_KEY}`
        },
    })

    params.length = responce.data.recordsTotal;

    params.start = 0;
    const courcesQueryString = new URLSearchParams(params);
    const courcesResponce = await axios.get(`${PORTAL_URL}?${courcesQueryString}`, {
        headers: {
            Cookie: `session=${SESSION_KEY}`
        },
    })
    
    let sumUAH = 0;
    let sumUSDT = 0;
    let cource = 0;

    courcesResponce.data.data.forEach(element => {
        sumUAH+= +(element[5].split(' ')[0]);
        sumUSDT+= +(element[7].split(' ')[0]);
    });
    cource = (sumUAH / sumUSDT).toFixed(4);

    const responceData = {
        ...responce.data,
        sumUSDT,
        sumUAH,
        cource
    }

    return responceData;
}

function formatDate(timestamp) {
    const timeZoneDifference = 1;

    const date = new Date(+timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Коррекция времени в 1 час для временной зоны сервака
    const hours = String(date.getHours() + timeZoneDifference).padStart(2, '0');

    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}