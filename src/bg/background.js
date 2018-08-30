var timeout;

var TARGET_HOURS = 8;//TODO: from options

var TODAY_BREAK_KEY = getBreakKey();
var TODAY_START_KEY = getStartKey();

chrome.history.onVisited.addListener(async (historyItem) => {
    if (!await storage.get(TODAY_START_KEY)) {
        await storage.set(TODAY_START_KEY, new Date().toISOString());
        setEndWorkTimeout(moment.duration(TARGET_HOURS, 'hours'));
    }
});

chrome.storage.onChanged.addListener(async function (changes, namespace) {
    var breaks = changes[TODAY_BREAK_KEY];
    if (breaks && breaks.newValue) {
        var todayStart = await storage.get(TODAY_START_KEY);
        if (todayStart) {
            var start = moment(todayStart);
            var target = start.add(8, 'hours').add(breaks.newValue, 'minutes');
            console.log('Target changed to:', print(target));
            setEndWorkTimeout(target.diff(moment()));
        }
    }
});

function setEndWorkTimeout(target) {
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(function () {
        showToast(TARGET_HOURS + " hours", `You've been working for ${TARGET_HOURS} hours. It's time to call it a day`);
    }, target);
}