const TODAY_BREAK_KEY = keys.getBreak();
const TODAY_START_KEY = keys.getStart();

let startBreakBtn;
let endBreakBtn;
let addBreakBtn;

const BREAK_START_KEY = 'breakStart';

document.addEventListener('DOMContentLoaded', init);

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        if (request.msg === "break_finished") {
            await endBreak(null, true);
        }
    }
);

async function init() {
    startBreakBtn = document.getElementById('start-break');
    endBreakBtn = document.getElementById('end-break');
    addBreakBtn = document.getElementById('add-custom-break');

    const breakHasStarted = await storage.get(BREAK_START_KEY);
    startBreakBtn.disabled = !!breakHasStarted;
    endBreakBtn.disabled = !breakHasStarted;

    createReport();

    startBreakBtn.addEventListener('click', startBreak);

    endBreakBtn.addEventListener('click', endBreak);

    addBreakBtn.addEventListener('click', addBreak);
}

async function startBreak(event) {
    await storage.set(BREAK_START_KEY, new Date().toISOString());

    startBreakBtn.disabled = true;
    endBreakBtn.disabled = false;

    helper.showToast('Break start', 'You started a break at ' + await helper.print(), true);
}

async function endBreak(event, skipCalulation) {
    if (skipCalulation !== true) {
        helper.endBreak();
    }

    startBreakBtn.disabled = false;
    endBreakBtn.disabled = true;

    createReport();
}

async function addBreak(event) {
    let todayTotalBreak = await storage.get(TODAY_BREAK_KEY) || 0;

    const breakDuration = +document.getElementById('customBreakDuration').value;
    todayTotalBreak += breakDuration;

    await storage.set(TODAY_BREAK_KEY, todayTotalBreak);

    createReport();

    helper.showToast('New break', 'You added a break which lasted ' + breakDuration + ' minutes');
}

async function createReport() {
    const todayStart = await storage.get(TODAY_START_KEY);

    if (todayStart) {
        const start = moment(todayStart);
        const end = moment();

        const breaks = await storage.get(TODAY_BREAK_KEY) || 0;

        const total = end.diff(start, 'minutes') - breaks;

        document.getElementById('start').textContent = await helper.print(start);
        document.getElementById('break').textContent = (breaks / 60).toFixed(2) + 'h';
        document.getElementById('end').textContent = await helper.print(end);
        document.getElementById('total').textContent = (total / 60).toFixed(2) + 'h';

        const text = document.getElementById('content').textContent.split(/\r?\n/).map(x => x.trim()).join('\r\n');

        copy(text, 'text/plain');
    }
}

function copy(str, mimeType) {
    document.oncopy = function (event) {
        event.clipboardData.setData(mimeType, str);
        event.preventDefault();
    };
    document.execCommand("copy", false, null);
}
