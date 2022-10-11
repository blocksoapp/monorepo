/*
 * Hooks (functions) shared across our components.
 */
import { useEffect, useState } from "react";

/*
 * General fetch hook ... useful for fetching any data w/ URL
 * Retrieves data from a URL.
 * Returns null if no data.
 */

export function useFetch(url) {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect((url) => {
        const getData = async () => {
        try {
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            })
            if (!res.ok) return
            const resData = await res.json();
            setData(resData)
            setIsLoading(false)

        } catch(err) {
          setError(err)
          console.log(err)
        }
    }
      getData()
    }, [url])

    return { data, isLoading, error }
    
}