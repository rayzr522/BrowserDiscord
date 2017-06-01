/**
 * @param {string} key The key of the property to get.
 * @param {any} value The (optional) value to set. Leave undefined to get a property.
 * 
 * @returns {any} The value stored under the given key, or undefined if setting a value.
 */
exports.ls = function ls(key, value) {
    if (!value) {
        return localStorage.getItem(key);
    }
    return localStorage.setItem(key, value);
};

exports.qs = function qs(key, value) {
    let location = window.location.search;
    if (location.indexOf('?') < 0) return;

    let raw = location.substr(location.indexOf('?') + 1);

    let mapped = {};
    raw.split('&')
        .map(item => item.split('='))
        .forEach(item => mapped[item[0]] = decodeURI(item[1]));

    if (!key) {
        return mapped;
    }

    if (value) {
        if (mapped[key] === value) {
            return;
        }

        mapped[key] = value;

        let newQueryString = '';
        for (let key in mapped) {
            newQueryString += `${newQueryString.length < 1 ? '?' : '&'}${key}=${encodeURI(mapped[key])}`
        }
        window.location.search = newQueryString;

        return;
    }

    return mapped[key];
};