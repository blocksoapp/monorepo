/* Module containing AJAX calls to the backend. */
import { baseAPI, getCookie } from './utils';


/* Returns the response for the comments of a post. */
export const apiGetComments = async (postId) => {
    const url = `${baseAPI}/posts/${postId}/comments/`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response for profile data given an address */
export const apiGetProfile = async (address) => {
    const url = `${baseAPI}/${address}/profile/`;
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        return res
}

/* Returns the response for the profiles of explore page. */
export const apiGetExplore = async () => {
    const url = `${baseAPI}/explore/`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response for the getting the feed items of the authed user. */
export const apiGetFeed = async () => {
    const url = `${baseAPI}/feed/`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response for the notifications of the authed user. */
export const apiGetNotifications = async () => {
    const url = `${baseAPI}/notifications/`;
    const resp = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return resp;
}

/* Returns the response for a specific post. */
export const apiGetPost = async (postId) => {
    const url = `${baseAPI}/post/${postId}/`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response for the posts of a given address. */
export const apiGetPosts = async (address) => {
    const url = `${baseAPI}/posts/${address}/`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response for the suggested users of the given query. */
export const apiGetSuggestedUsers = async (query) => {
    const url = `${baseAPI}/users/?q=${query}`;
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response for the given url. */
export const apiGetUrl = async (url) => {
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    return res;
}

/* Returns the response of marking the authed user's notifications as read. */
export const apiMarkNotificationsRead = async (ids) => {
    const url = `${baseAPI}/notifications/`;
    const data = {"notifications": ids}
    const resp = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFTOKEN': getCookie('csrftoken')
        },
        credentials: 'include'
    });
    return resp;
}

/* Returns the response for followers list given an address */
export const apiGetFollowers = async (address) => {
    const url = `${baseAPI}/${address}/followers/`
      const res = await fetch(url, {
          method: 'GET',
          credentials: 'include'
      });
      return res
}

/* Returns the response for following list given an address */
export const apiGetFollowing = async (address) => {
    const url = `${baseAPI}/${address}/following/`
      const res = await fetch(url, {
          method: 'GET',
          credentials: 'include'
      });
      return res
}

/* Returns the response for updating follow given an address  */
export const apiPostFollow = async (address) => {
    const url = `${baseAPI}/${address}/follow/`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        return res
}

/* Returns the response for updating unfollow given an address  */
export const apiPostUnfollow = async (address) => {
    const url = `${baseAPI}/${address}/follow/`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
            'X-CSRFTOKEN': getCookie('csrftoken')
            },
            credentials: 'include'
        });
        return res
}
