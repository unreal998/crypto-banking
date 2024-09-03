const SERVER_URL = 'http://188.119.112.129:3003';
// const SERVER_URL = 'http://localhost:3003';


const binanceTable = document.getElementById('binanceTable');
const tableBody = document.querySelector('#binanceTable tbody');
const portalBody = document.querySelector('#portalTable tbody');

const timeSelector = document.getElementById('timeSelector') // вместо id впиши id селектора


const HOUR = Date.now() - 3600000;

flatpickr("#timeSelector", {
    enableTime: true,
    enableSeconds: true,
    dateFormat: "d.m.Y H:i:S",  // Настраиваем формат даты и времени
    defaultDate: formatTime(HOUR),
    time_24hr: true  // 24-часовой формат времени
  });

timeSelector.addEventListener('change', (value) => {
    fetchPortalData(1, new Date(convertToTheDateTime(value.target.value)).getTime());
    fetchBinanceData(1, new Date(convertToTheDateTime(value.target.value)).getTime());
})
     
async function handleFilterData(days, page) {
    tableBody.innerHTML = '';
    const loader = document.createElement('div');
    loader.className += 'loader'
    tableBody.appendChild(loader);

    const binanceData = await fetch(`${SERVER_URL}/transfers?days=${days}&page=${page}`)
    .then((response) => {
        return response.json();
    }).then(data => data);
    return binanceData;
}

window.addEventListener('load', () => {
    fetchPortalData(1, HOUR);
    fetchBinanceData(1, HOUR);
});

async function fetchPortalData(page, days) {
    handlePortalData(page, days).then(data => {
        processPortalTable(data, page, days);
    });
}

async function fetchBinanceData(page, days) {
    handleFilterData(days, page).then(data => {  
        processP2PTableData(data, days, page);
    })
}

async function handlePortalData(page, days) {
    portalBody.innerHTML = '';
    createLoader();
    const portalData = await fetch(`${SERVER_URL}/portalData?page=${page}&days=${days}`)
    .then((response) => {
        return response.json();
    })
    .then(data => data);

    return portalData;
}

function createLoader() {
    const loader = document.createElement('div');
    loader.className += 'loader'
    portalBody.appendChild(loader);
}

function processPortalTable(data, page, days) {
    portalBody.innerHTML = '';

    data.data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="body1 body1S1">${index + 1}</td>
            <td class="body1 body1S1">${item[1]}</td>
            <td class="body1 body1S">${item[2]}</td>
            <td class="body1 body1S1">${item[3]}</td>
            <td  class="body1 body1S">${item[4]}</td>
            <td  class="body1 body1S">${item[5]}</td>
            <td  class="body1 body1S1">${item[6]}</td>
            <td  class="body1">${item[7]}</td>
            <td  class="body1">${item[8]}</td>
            <td  class="body1">${item[9]}</td>
        `;
        portalBody.appendChild(row);
    });
    const summRow = document.createElement('tr');
    summRow.innerHTML = `
        <td class="body1">Получено UAH: ${data.sumUAH.toFixed(4)}</td>
        <td class="body1">Продано USDT: ${data.sumUSDT.toFixed(4)}</td>
        <td class="body1">Средний курс продажи с ${formatTime(days)} в UAH: ${data.cource}</td>
    `;
    portalBody.appendChild(summRow);
    const paginationControls = document.getElementById('pagination');
    setupPagination(data.recordsFiltered, 25, page, days, paginationControls, 'pagination', fetchPortalData);
}

function processP2PTableData(data, days, page) {
    tableBody.innerHTML = '';

    data.data.forEach((rowData, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="body1 body1S1">${index + 1}</td>
            <td class="body1">${rowData.orderNumber}</td>
            <td class="body1">${formatTime(rowData.createTime)}</td>
            ${rowData.tradeType === 'BUY' ? `<td class="body1 body1S">${(+rowData.amount).toFixed(4)} ${rowData.asset}</td>` : `<td class="body1 body1S">${(+rowData.totalPrice).toFixed(4)} ${rowData.fiat}</td>`}
            ${rowData.tradeType === 'BUY' ? `<td class="body1 body1S">${(+rowData.totalPrice).toFixed(4)} ${rowData.fiat}</td>` : `<td class="body1 body1S">${(+rowData.amount).toFixed(4)} ${rowData.asset}</td>`}
            <td class="body1">${rowData.unitPrice}</td>
            <td class="body1 body1S">${rowData.payMethodName}</td>
        `;
        if (rowData.tradeType === 'SELL') {
            row.className += ' red'
        } else {
            row.className += ' green'
        }
        tableBody.appendChild(row);
    });
    const summRow = document.createElement('tr');
    summRow.innerHTML = `
        <td class="body1">Всего куплено: ${data.buyTotal}</td>
        <td class="body1">Всего продано: ${data.soldTotal}</td>
        <td class="body1">Средний курс покупки с ${formatTime(days)} в UAH: ${data.buyCourse}</td>
        <td class="body1">Средний курс продажи с ${formatTime(days)} в UAH: ${data.soldCourse}</td>
    `;
    tableBody.appendChild(summRow);
    const paginationControls = document.getElementById('paginationBinance');
    setupPagination(data.total, 50, page, days, paginationControls, 'paginationBinance', fetchBinanceData);
}

function setupPagination(totalItems, rowsPerPage, currentPage, days, paginationControls, paginationName, callback) {
    const pageCount = Math.ceil(totalItems / rowsPerPage);
    paginationControls.innerHTML = '';

    if (pageCount > 4) {
        if (currentPage > 1) {
            if (currentPage + 4 > pageCount) {
                for(let i = currentPage - 1; i <= pageCount; i++) {
                    paginationControls.appendChild(createButton(i, currentPage, days, paginationName, callback));
                }
            } else {
                for(let i = currentPage - 1; i <= currentPage + 4; i++) {
                    paginationControls.appendChild(createButton(i, currentPage, days, paginationName, callback));
                }
            }
        } else {
            for(let i = 1; i <= 4; i++) {
                paginationControls.appendChild(createButton(i, currentPage, days, paginationName, callback));
            }
        }

        if (pageCount > 7 && currentPage <= pageCount - 4) {
            const ellipsis = document.createElement('span');
            ellipsis.innerText = '...';
            paginationControls.appendChild(ellipsis);
            paginationControls.appendChild(createButton(pageCount, currentPage, days, paginationName, callback));
        }
    } else {
        for(let i = 1; i <= pageCount; i++) {
            paginationControls.appendChild(createButton(i, currentPage, days, paginationName, callback));
        }
    }
}

function createButton(text, currentPage, days, paginationName, callback) {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = text === currentPage ? 'active' : '';
        button.addEventListener('click', () => {
            document.querySelector(`#${paginationName} button.active`).classList.remove('active');
            button.classList.add('active');
            callback(text, days);
        });
        return button
}

function formatTime(time) {
    const dateTime = new Date(time);

    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0, поэтому добавляем 1
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const secconds = String(dateTime.getSeconds()).padStart(2, '0');
    
    const localDatetime = `${day}-${month}-${year} ${hours}:${minutes}:${secconds}`;
    return localDatetime;
}

function convertToTheDateTime(dateTimeString) {
    const splitedString = dateTimeString.split(' ');
    const dateString = splitedString[0].split('.');
    let convertedString = `${dateString[1]}.${dateString[0]}.${dateString[2]} ${splitedString[1]}`;
    if (IsSafari()) {
        convertedString = `${dateString[1]}/${dateString[0]}/${dateString[2]}, ${splitedString[1]}`;
    }
    return convertedString;
}

function IsSafari() {
    const is_safari = navigator.vendor.indexOf('Apple') > -1;
    return is_safari;
}