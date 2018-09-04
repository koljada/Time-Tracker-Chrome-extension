var TODAY_BREAK_KEY = getBreakKey();
var TODAY_START_KEY = getStartKey();

const BREAK_START_KEY = 'breakStart';

document.addEventListener('DOMContentLoaded', async function () {

    const startBreakBtn = document.getElementById('start-break');
    const endBreakBtn = document.getElementById('end-break');
    const addBreakBtn = document.getElementById('add-custom-break');

    let breakHasStarted = await storage.get(BREAK_START_KEY);
    startBreakBtn.disabled = !!breakHasStarted;
    endBreakBtn.disabled = !breakHasStarted;

    createReport();

    startBreakBtn.addEventListener('click', startBreak);

    endBreakBtn.addEventListener('click', endBreak);

    addBreakBtn.addEventListener('click', addBreak);

    async function startBreak(event) {
        await storage.set(BREAK_START_KEY, new Date().toISOString());

        startBreakBtn.disabled = true;
        endBreakBtn.disabled = false;

        showToast('Break start', 'You started a break at ' + await print(), true);
    }

    async function endBreak(event) {
        endBreakBase();

        startBreakBtn.disabled = false;
        endBreakBtn.disabled = true;

        createReport();
    }

    async function addBreak(event) {
        var todayTotalBreak = await storage.get(TODAY_BREAK_KEY) || 0;

        var breakDuration = +document.getElementById('customBreakDuration').value
        todayTotalBreak += breakDuration;

        await storage.set(TODAY_BREAK_KEY, todayTotalBreak);

        createReport();

        showToast('New break', 'You added a break which lasted ' + breakDuration + ' minutes');
    }

    async function createReport() {        
        var todayStart = await storage.get(TODAY_START_KEY);

        if (todayStart) {
            var start = moment(todayStart);
            var end = moment();

            var breaks = await storage.get(TODAY_BREAK_KEY) || 0;

            var total = end.diff(start, 'minutes') - breaks;

            document.getElementById('start').textContent = await print(start);
            document.getElementById('break').textContent = (breaks / 60).toFixed(2) + 'h';
            document.getElementById('end').textContent = await print(end);
            document.getElementById('total').textContent = (total / 60).toFixed(2) + 'h';

            var text = document.getElementById('content').textContent.split(/\r?\n/).map(x => x.trim()).join('\r\n');

            copy(text, 'text/plain');
        }
    }
});

function copy(str, mimeType) {
    document.oncopy = function (event) {
        event.clipboardData.setData(mimeType, str);
        event.preventDefault();
    };
    document.execCommand("copy", false, null);

}