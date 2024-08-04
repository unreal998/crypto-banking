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
    handleFilterData(DAY).then(data => {  
        processP2PTableData(data, 'день');
    })
})

weekBtn.addEventListener('click', () => {
    handleFilterData(WEEK).then(data => {
        processP2PTableData(data, 'неделю');
    })
})

monthBtn.addEventListener('click', () => {
    handleFilterData(MONTH).then(data => {
        processP2PTableData(data, 'месяц');
    })
})

async function handleFilterData(days) {
    tableBody.innerHTML = '';
    const loader = document.createElement('div');
    loader.className += 'loader'
    tableBody.appendChild(loader);

    const binanceData = await fetch(`http://localhost:3003/transfers?days=${days}`)
    .then((response) => {
        return response.json();
    }).then(data => data);
    return binanceData;
}

window.addEventListener('load', () => {
    fetchPortalData(1);
    handleFilterData(DAY).then(data => {  
        processP2PTableData(data, 'день');
    })
});

async function fetchPortalData(page) {
    handlePortalData(page).then(data => {
        processPortalTable(data, page);
    });
}

async function handlePortalData(page) {
    portalBody.innerHTML = '';
    createLoader();
    const portalData = await fetch(`http://localhost:3003/portalData?page=${page}`)
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

function processPortalTable(data, page) {
    portalBody.innerHTML = '';
    data.data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="body1 body1S">${index}</td>
                <td class="body1 body1S">${item[1]}</td>
                <td class="body1 body1S">${item[2]}</td>
                <td class="body1 body1S">${item[3]}</td>
                <td class="body1 body1S">${item[4]}</td>
                <td class="body1 body1S">${item[5]}</td>
                <td class="body1 body1S">${item[6]}</td>
                <td class="body1 body1S">${item[7]}</td>
                <td class="body1 body1S">${item[8]}</td>
                <td class="body1">${item[9]}</td>
                <td class="body1">${item[10]}</td>
                <td class="body1 body1S">${item[11]}</td>
            `;
        portalBody.appendChild(row);
    });
    const summRow = document.createElement('tr');
    summRow.innerHTML = `
        <td class="body1">Общий вход: ${summ}</td>
        <td class="body1">Общий выход: ${minus}</td>
        <td class="body1 ${result > 0 ? 'green' : 'red'}">Отчёт за ${days}: ${result}</td>
    `;
    portalBody.appendChild(row);
    setupPagination(data.recordsFiltered, 25, page);
}

function setupPagination(totalItems, rowsPerPage, currentPage) {
    const pageCount = Math.ceil(totalItems / rowsPerPage);
    const paginationControls = document.getElementById('pagination');
    paginationControls.innerHTML = '';

    if (pageCount > 4) {
        if (currentPage > 1) {
            for(let i = currentPage - 1; i <= currentPage + 4; i++) {
                paginationControls.appendChild(createButton(i, currentPage));
            }
        } else {
            for(let i = 1; i <= 4; i++) {
                paginationControls.appendChild(createButton(i, currentPage));
            }
        }

        if (pageCount > 7) {
            const ellipsis = document.createElement('span');
            ellipsis.innerText = '...';
            paginationControls.appendChild(ellipsis);
            paginationControls.appendChild(createButton(pageCount, currentPage));
        }
    } else {
        for(let i = 1; i <= pageCount; i++) {
            paginationControls.appendChild(createButton(i, currentPage));
        }
    }
}

function createButton(text, currentPage) {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = text === currentPage ? 'active' : '';
        button.addEventListener('click', () => {
            document.querySelector('#pagination button.active').classList.remove('active');
            button.classList.add('active');
            fetchPortalData(text);
        });
        return button
}

function processTableData(data, days) {
    tableBody.innerHTML = '';
    let summ = 0;
    let minus = 0;
    data.deposites.forEach(rowData => {
        const row = document.createElement('tr');
        row.className += ' green'
        row.innerHTML = `
            <td class="body1">${rowData.orderNumber}</td>
            <td class="body1">${rowData.address}</td>
            <td class="body1 body1L">${formatTime(rowData.insertTime)}</td>
            <td class="body1 body1S">${rowData.amount}</td>
            <td class="body1 body1S">${rowData.coin}</td>
            <td class="body1 body1S">${rowData.network}</td>
        `;
        summ += (+rowData.amount);
        tableBody.appendChild(row);
    });
    data.withdrawals.forEach(rowData => {
        const row = document.createElement('tr');
        row.className += ' red'
        row.innerHTML = `
            <td class="body1">${rowData.id}</td>
            <td class="body1">${rowData.address}</td>
            <td class="body1 body1L">${rowData.completeTime}</td>
            <td class="body1 body1S">${rowData.amount}</td>
            <td class="body1 body1S">${rowData.coin}</td>
            <td class="body1 body1S">${rowData.network}</td>
        `;
        minus -= (+rowData.amount);
        tableBody.appendChild(row);
    });
    const result = summ + minus;
    const summRow = document.createElement('tr');
    summRow.innerHTML = `
        <td class="body1">Общий вход: ${summ}</td>
        <td class="body1">Общий выход: ${minus}</td>
        <td class="body1 ${result > 0 ? 'green' : 'red'}">Отчёт за ${days}: ${result}</td>
    `;
    tableBody.appendChild(summRow);
}

function processP2PTableData(data, days) {
    tableBody.innerHTML = '';
    let summ = 0;
    let minus = 0;
    let cours = 0;
    let count = 0;
    let fullCount = 0;
    data.forEach(rowData => {
        if(rowData.orderStatus !== 'COMPLETED') {
            return;
        }
        fullCount++;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="body1 body1S">${fullCount}</td>
            <td class="body1">${rowData.orderNumber}</td>
            <td class="body1 body1L">${formatTime(rowData.createTime)}</td>
            <td class="body1 body1S">${rowData.amount}</td>
            <td class="body1">${rowData.unitPrice}</td>
            <td class="body1 body1S">${rowData.asset}</td>
            <td class="body1 body1S">${rowData.payMethodName}</td>
        `;
        if (rowData.tradeType === 'SELL') {
            row.className += ' red'
            minus -= rowData.amount
        } else {
            row.className += ' green'
            summ += (+rowData.amount);
            cours += (+rowData.unitPrice)
            count += 1;
        }
        tableBody.appendChild(row);
    });
    const result = summ + minus;
    const summRow = document.createElement('tr');
    summRow.innerHTML = `
        <td class="body1">Общий вход: ${summ}</td>
        <td class="body1">Общий выход: ${minus}</td>
        <td class="body1 ${result > 0 ? 'green' : 'red'}">Отчёт за ${days}: ${result}</td>
        <td class="body1">Средний курс за ${days}: ${(cours/count).toFixed(4)}</td>
    `;
    tableBody.appendChild(summRow);
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
