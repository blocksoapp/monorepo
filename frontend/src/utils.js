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
