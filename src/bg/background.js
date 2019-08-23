let timeout, todayStart;

const TARGET_HOURS = 8;//TODO: from options

const TODAY_BREAK_KEY = keys.getBreak();
const TODAY_START_KEY = keys.getStart();
console.log(TODAY_BREAK_KEY, TODAY_START_KEY);

// TODO: check notification id
chrome.notifications.onButtonClicked.addListener(async (id, buttonIndex) => {
    await helper.endBreak();
    chrome.notifications.clear(id);
    chrome.runtime.sendMessage({ msg: "break_finished" });
});

(async function checkHistory() {
    todayStart = await storage.get(TODAY_START_KEY);

    if (!todayStart) {
        chrome.history.search({
            startTime: moment().startOf('day').valueOf(),
            maxResults: 10000,
            text: ''
        }, visits => {
            let date = new Date();
            if (visits.length) {
                date = new Date(visits[visits.length - 1].lastVisitTime);
            }

            setStartDate(date);
        });
    }
})();

//chrome.history.onVisited.addListener(e => setStartDate(new Date()));

async function setStartDate(date) {
    if (!todayStart) {
        await storage.set(TODAY_START_KEY, date.toISOString());
        setEndWorkTimeout(moment.duration(TARGET_HOURS, 'hours'));
    }
}

chrome.storage.onChanged.addListener(async function (changes, namespace) {
    const breaks = changes[TODAY_BREAK_KEY];
    if (breaks && breaks.newValue) {
        const todayStart = await storage.get(TODAY_START_KEY);
        if (todayStart) {
            const start = moment(todayStart);
            const workHours = await storage.workHours.get();
            const target = start.add(workHours, 'h').add(breaks.newValue, 'm');
            console.log('Target changed to:', await helper.print(target));
            setEndWorkTimeout(target.diff(moment()));
        }
    }
});

chrome.contextMenus.create({
    title: "History",
    contexts: ["browser_action"],
    onclick: (e) => chrome.tabs.create({
        url: "src/history/index.html"
    }),
});


function setEndWorkTimeout(target) {
    if (timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        helper.showToast(TARGET_HOURS + " hours", `You've been working for ${TARGET_HOURS} hours. It's time to call it a day`);
    }, target);
}
