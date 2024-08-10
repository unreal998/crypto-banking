const SERVER_URL = 'http://188.119.112.129:3003';
const LOCALHOST = 'http://localhost:3003';

const dayBtn = document.getElementById('day');
const weekBtn = document.getElementById('week');
const monthBtn = document.getElementById('month');
const binanceTable = document.getElementById('binanceTable');
const tableBody = document.querySelector('#binanceTable tbody');
const portalBody = document.querySelector('#portalTable tbody');

const DAY = 1;
const WEEK = 7;
const MONTH = 30;

dayBtn.addEventListener('click', () => {
    fetchBinanceData(1, DAY);
    fetchPortalData(1, DAY);
})

weekBtn.addEventListener('click', () => {
    fetchBinanceData(1, WEEK);
    fetchPortalData(1, WEEK);
})

monthBtn.addEventListener('click', () => {
    fetchBinanceData(1, MONTH);
    fetchPortalData(1, MONTH);
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
    fetchPortalData(1, DAY);
    fetchBinanceData(DAY, 1);
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
            <td class="body1 body1S">${index + 1}</td>
            <td class="body1 body1S">${item[1]}</td>
            <td class="body1 body1S">${item[2]}</td>
            <td class="body1 body1S">${item[3]}</td>
            <td class="body1 body1S">${item[4]}</td>
            <td class="body1 body1S">${item[5]}</td>
            <td class="body1">${item[6]}</td>
            <td class="body1">${item[7]}</td>
            <td class="body1">${item[8]}</td>
            <td class="body1">${item[9]}</td>
            <td class="body1">${item[10]}</td>
            <td class="body1 body1S">${item[11]}</td>
        `;
        portalBody.appendChild(row);
    });
    const dayString = days === 1 ? 'день' : 'дней';
    const summRow = document.createElement('tr');
    summRow.innerHTML = `
        <td class="body1">Получено UAH: ${data.sumUAH.toFixed(4)}</td>
        <td class="body1">Продано USDT: ${data.sumUSDT.toFixed(4)}</td>
        <td class="body1">Средний курс продажи за ${days} ${dayString} в UAH: ${data.cource}</td>
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
            <td class="body1 body1S">${index + 1}</td>
            <td class="body1">${rowData.orderNumber}</td>
            <td class="body1">${formatTime(rowData.createTime)}</td>
            <td class="body1 body1S">${(+rowData.amount).toFixed(4)} ${rowData.asset}</td>
            <td class="body1 body1S">${(+rowData.totalPrice).toFixed(4)} ${rowData.fiat}</td>
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
    const dayString = days === 1 ? 'день' : 'дней';
    summRow.innerHTML = `
        <td class="body1">Всего куплено: ${data.buyTotal}</td>
        <td class="body1">Всего продано: ${data.soldTotal}</td>
        <td class="body1">Средний курс покупки за ${days} ${dayString} в UAH: ${data.buyCourse}</td>
        <td class="body1">Средний курс продажи за ${days} ${dayString} в UAH: ${data.soldCourse}</td>
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
    const dateFromTimestamp = new Date(time);
    const year = dateFromTimestamp.getFullYear();
    const month = dateFromTimestamp.getMonth();
    const day = dateFromTimestamp.getDate();
    const hours = dateFromTimestamp.getHours();
    const minutes = dateFromTimestamp.getMinutes();
    const secconds = dateFromTimestamp.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${secconds}`
}
