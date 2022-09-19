/*
 * URL of backend.
 */
export const baseAPI = `${process.env.REACT_APP_BACKEND_URL}/api`


/*
 * Return value of cookie with the given name.
 */
export function getCookie(name) {
    if (!document.cookie) {
      return null;
    }
  
    const xsrfCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith(name + '='));
  
    if (xsrfCookies.length === 0) {
      return null;
    }
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
  }
 