async function init(key, parent) {
    const records = await storage.get(key);

    const tbody = document.querySelector('#' + parent + ' .tbody');

    let total = 0;
    let average = 0;

    if (records) {
        Object.keys(records)
            .sort((a, b) => moment(a).isSameOrBefore(moment(b)) ? -1 : 1)
            .forEach((key) => {
                total += records[key];
                const row = createRow(key, records[key]);
                tbody.appendChild(row);
            });

        average = (total / 60 / Object.keys(records).length).toFixed(2);
    }

    const tfoot = document.querySelector('#' + parent + ' .tfoot');
    if (total) {
        const row = createRow(average, total);
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

document.querySelectorAll('#tabs a').forEach((a) => {
    a.addEventListener('click', (ev) => {
        ev.preventDefault();
        document.querySelectorAll('#tabs li').forEach((li) => li.classList.remove('active'));
        a.parentElement.classList.add('active');

        document.querySelectorAll('.tab-content .tab-pane').forEach((pane) => {
            if (pane.id === a.getAttribute('href').replace('#', '')) {
                pane.style.display = 'block';
                pane.classList.add('active');
            }
            else {
                pane.style.display = 'none';
                pane.classList.remove('active');
            }
        });
    });
});

const weekKey = keys.getWeekHistory();
const monthKey = keys.getMonthHistory();

document.addEventListener('DOMContentLoaded', () => {
    init(weekKey, 'week');
    init(monthKey, 'month');
}, false);