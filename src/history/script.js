async function init(key) {
    const records = await storage.get(key);

    const tbody = document.getElementById('tbody');

    let total = 0;

    Object.keys(records).forEach((key) => {
        total += records[key];
        const row = createRow(key, records[key]);
        tbody.appendChild(row);
    });

    const tfoot = document.getElementById('tfoot');
    if (total) {
        const row = createRow('', total);
        tfoot.appendChild(row);
    }
    else {
        tfoot.style.display = 'none';
    }
};

function createRow(dateString, durationInMinutes) {
    const row = document.createElement('tr');
    const date = document.createElement('td');
    date.innerText = dateString;
    row.appendChild(date);
    const duration = document.createElement('td');
    duration.innerText = (durationInMinutes / 60).toFixed(2);
    row.appendChild(duration);

    return row;
};