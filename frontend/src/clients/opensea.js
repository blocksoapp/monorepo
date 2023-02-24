/*
 * Module for interacting with the Opensea API.
 * Requests are rate limited to 4/sec as specified by Opensea.
 * https://docs.opensea.io/reference/retrieving-assets
 */
import { TokenBucketRateLimiter } from "./ratelimiter";
import { sleep } from "../utils";


/* Rate limiter for Opensea API, 4 requests per second. */
export const tokenBucket = new TokenBucketRateLimiter({
    maxRequests: 4,
    maxRequestWindowMS: 1000
});


/* Call an API function and retry if the response is 429 (rate limited). */
export const fetchWithRateLimitRetry = async (callAPIFn) => {
    const response = await callAPIFn();
    if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        await sleep(retryAfter * 1000);
        return fetchWithRateLimitRetry(callAPIFn);
  }

  return response
}


/*
 * Get Opensea Asset.
 * Returns the response of the API call.
 */
export const apiGetAsset = async (contractAddress, tokenId, controller) => {
    const url = `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}/`;
    const resp = await fetch(url, {
        method: "GET",
        signal: controller.signal,
    });
    return resp;
};
