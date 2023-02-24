/* 
 * Class for use by clients that want to rate limit requests to an API.
 * From https://www.useanvil.com/blog/engineering/throttling-and-consuming-apis-with-429-rate-limits/
 */
import { sleep } from "../utils";


class TokenBucketRateLimiter {
  constructor ({ maxRequests, maxRequestWindowMS }) {
    this.maxRequests = maxRequests
    this.maxRequestWindowMS = maxRequestWindowMS
    this.reset()
  }

  reset () {
    this.count = 0
    this.resetTimeout = null
  }

  scheduleReset () {
    // Only the first token in the set triggers the resetTimeout
    if (!this.resetTimeout) {
      this.resetTimeout = setTimeout(() => (
        this.reset()
      ), this.maxRequestWindowMS)
    }
  }

  async acquireToken (fn) {
    this.scheduleReset()

    if (this.count === this.maxRequests) {
      await sleep(this.maxRequestWindowMS)
      return this.acquireToken(fn)
    }

    this.count += 1
    return fn()
  }
}


export { TokenBucketRateLimiter };
