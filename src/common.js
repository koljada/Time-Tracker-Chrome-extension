storage = {
    get: getFromLocalStorage,
    set: setToLocalStorage,
    remove: removeFromLocalStorage
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

chrome.notifications.onButtonClicked.addListener(async (id, buttonIndex) => await endBreakBase());

async function endBreakBase() {
    const TODAY_BREAK_KEY = getBreakKey();
    const BREAK_START_KEY = 'breakStart';

    var todayTotalBreak = await storage.get(TODAY_BREAK_KEY) || 0;

    var breakStart = await storage.get(BREAK_START_KEY);

    if (breakStart) {
        var diffInMinutes = (new Date() - new Date(breakStart)) / 60000;

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

function getBreakKey() {
    return moment().format('[breakInMinutes]: YYYY-MM-DD');
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

    var breaksKey = getBreakKey();
    return await storage.set(breaksKey, await storage.get(breaksKey) + 0.01);
}

/**
 * Convert datetime to the timezone and format it
 * @param {Moment} time Datetime. Current datetime by default
 * @param {string} format Datetime format. 'HH:mm' by default
 * @returns {string} Datetime string
 */
async function print(time, format) {
    var zone = await getTimezone();

    time = time || moment();
    format = format || 'HH:mm';    

    return time.tz(zone).format(format);
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