import { utils } from "ethers";


/*
 * URL of backend.
 */
export const baseAPI = `${process.env.REACT_APP_BACKEND_URL}/api`

/* 
 * Nft.Storage API Key
 */
export const nftAPI = process.env.REACT_APP_NFT_KEY

/*
 * Return value of cookie with the given name.
 */
export function getCookie(name) {
    if (!document.cookie) {
      console.log('could not find cookie')
      return null;
    }
    const xsrfCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith(name + '='));
  
    if (xsrfCookies.length === 0) {
      console.log('cookies length was equal to 0')
      return null;
    }
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
  }

/*
 * Returns an abbreviated version of the given address.
 */
export function abbrAddress(address) {
    return address.substr(2,4) + "..." + address.substr(38,4);
}

/*
 * Returns an abbreviated time delta based on
 * the current time and the given timestamp.
 *  - If the given timestamp was greater than a day ago,
 *      the return value is formatted according to the
 *      given datetime formatting options in the user's locale.
 *  - If the given timestamp is between 1 day and 1 hour,
 *      the return value is formatted as "1-23h ago".
 *  - If the given timestamp is between 1 hour and 1 minute,
 *      the return value is formatted as "1-59m ago".
 *  - If the given timestamp is between 1 minute and 1 second,
 *      the return value is formatted as "1-59s ago".
 */
export function getTimeAgo(timestamp, dtFmtOpts) {
    // get difference between now and timestamp
    const backThen = new Date(timestamp);
    const diff = Date.now() - backThen;  // milliseconds

    // intervals to compare with
    const secondInMillis = 1000;
    const minuteInMillis = 60 * 1000;
    const hourInMillis = minuteInMillis * 60; 
    const dayInMillis = hourInMillis * 24; 

    // between 0s and 1m ago, show as 59s
    if (diff >= 0 && diff < minuteInMillis) {
        return `${parseInt(diff/secondInMillis)}s`;
    }
    // between 1m and 1h ago, show as 59m
    if (diff >= minuteInMillis && diff < hourInMillis) {
        return `${parseInt(diff/minuteInMillis)}m`;
    }
    // more than 1 hour ago, show as 23h
    if (diff >= hourInMillis && diff < dayInMillis) {
        return `${parseInt(diff/hourInMillis)}h`;
    }
    // more than 1 day ago, show as Nov. 7
    if (diff >= dayInMillis) {
        return backThen.toLocaleDateString("en-US", dtFmtOpts);
    }
}

/* 
 * Formats token amount with decimal places.
 */
export function formatTokenAmount(amount, decimals) {
    var formatted = utils.formatUnits(amount, decimals);
    formatted = (+formatted).toFixed(4);  // truncate after 4 places
    return formatted;
}
