/**
 * Create random notification id
 * @returns {string} Random number for the notification id
 */
function getNotificationId() {
    return (Math.floor(Math.random() * 9007199254740992) + 1).toString();
}

/**
 * Show browser notification
 * @param {any} title Notification title
 * @param {any} message Notification message
 */
function showToast(title, message) {
    var id = getNotificationId();
    chrome.notifications.create(id, {
        title: title,
        iconUrl: '../../icons/icon128.png',
        type: 'basic',
        message: message
    }, function () { console.log('Message created', chrome.lastError, id); });
}

function getStartKey() {
    return new Date().toLocaleDateString();
    //return moment().format('[start]: YYYY-MM-DD');
}

function getBreakKey() {
    return moment().format('[breakInMinutes]: YYYY-MM-DD');
}

/**
 * Convert datetime to the timezone and format it
 * @param {Moment} time Datetime. Current datetime by default
 * @param {string} format Datetime format. 'HH:mm' by default
 * @returns {string} Datetime string
 */
function print(time, format) {
    const zone = "Europe/Kiev";//TODO: from options

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


storage = {
    get: getFromLocalStorage,
    set: setToLocalStorage,
    remove: removeFromLocalStorage
};