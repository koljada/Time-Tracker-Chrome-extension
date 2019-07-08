const storage = {
    get: getFromLocalStorage,
    set: setToLocalStorage,
    remove: removeFromLocalStorage,

    timezone: {
        get: getTimezone,
        set: setTimezone,
    },
    workHours: {
        get: getWorkHours,
        set: setWorkHours,
    },
};

const helper = {
    showToast: showToast,
    print: print,
    endBreak: endBreakBase,
};

const keys = {
    getStart: getStartKey,
    getEnd: getEndKey,
    getBreak: getBreakKey,
    getMonthHistory: getMonthHistoryKey,
    getWeekHistory: getWeekHistoryKey,
};

/**
 * Show browser notification
 * @param {string} title Notification title
 * @param {string} message Notification message
 * @param {boolean} withButton Whether include a button
 */
function showToast(title, message, withButton) {
    let options = {
        title: title,
        iconUrl: '../../icons/icon128.png',
        type: 'basic',
        message: message
    };

    if (withButton) {
        options.requireInteraction = true;
        options.buttons = [{ title: 'Finish break' }];
    }

    chrome.notifications.create(null, options, function (id) { console.log('Message created', chrome.lastError, id); });
}

/**
 * Convert datetime to the timezone and format it
 * @param {Moment} time Datetime. Current datetime by default
 * @param {string} format Datetime format. 'HH:mm' by default
 * @returns {string} Datetime string
 */
async function print(time, format) {
    const zone = await getTimezone();

    time = time || moment();
    format = format || 'HH:mm';

    return time.tz(zone).format(format);
}


async function endBreakBase(fromNotification) {
    const TODAY_BREAK_KEY = getBreakKey();
    const BREAK_START_KEY = 'breakStart';

    let todayTotalBreak = await storage.get(TODAY_BREAK_KEY) || 0;

    const breakStart = await storage.get(BREAK_START_KEY);

    if (breakStart) {
        const diffInMinutes = (new Date() - new Date(breakStart)) / 60000;

        todayTotalBreak += diffInMinutes;

        await storage.set(TODAY_BREAK_KEY, todayTotalBreak);

        await storage.remove(BREAK_START_KEY);

        showToast('Break end', 'You ended a break at ' + await print() + '. Break duration: ' + diffInMinutes.toFixed(2) + ' minutes');
    }
}

function getStartKey() {
    return new Date().toLocaleDateString();
    //return moment().format('[start]: YYYY-MM-DD');
}

function getEndKey() {
    return 'end:' + new Date().toLocaleDateString();
    //return moment().format('[start]: YYYY-MM-DD');
}

function getBreakKey() {
    return moment().format('[breakInMinutes]: YYYY-MM-DD');
}

function getMonthHistoryKey() {
    const currentDate = moment();
    const year = currentDate.year();
    const month = currentDate.month();

    return `month_history:${year}/${month}`;
}

function getWeekHistoryKey() {
    const currentDate = moment();
    const year = currentDate.year();
    const week = currentDate.week();

    return `week_history:${year}/${week}`;
}

async function getTimezone() {
    return await storage.get('user-timezone') || moment.tz.guess();
}

async function setTimezone(timezone) {
    return await storage.set('user-timezone', timezone);
}

async function getWorkHours() {
    return await storage.get('user-work-hours') || 8;
}

async function setWorkHours(workHours) {
    await storage.set('user-work-hours', workHours);

    const breaksKey = getBreakKey();

    return await storage.set(breaksKey, await storage.get(breaksKey) + 0.01);
}


//TODO: handle lastError

/**
 * Get value from the storage by the single key
 * @param {string} key Key
 * @returns {Promise} Promise
 */
async function getFromLocalStorage(key) {
    return new Promise(resolve => chrome.storage.local.get(key, result => resolve(result[key])));
}

/**
 * Set value to the storage
 * @param {string} key Key
 * @param {any} value Value
 * @returns {Promise} Promise
 */
async function setToLocalStorage(key, value) {
    let obj = {};
    obj[key] = value;
    return new Promise(resolve => chrome.storage.local.set(obj, () => resolve(obj)));
}

/**
 * Remove value from the storage by the single key
 * @param {string} key Key
 * @returns {Promise} Promise
 */
async function removeFromLocalStorage(key) {
    return new Promise(resolve => chrome.storage.local.remove(key, () => resolve()));
}
