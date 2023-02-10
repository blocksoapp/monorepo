/*
 * A react functional component that paginates on scroll.
 */
import { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { usePageBottom } from '../../hooks/usePageBottom';
import { apiGetUrl } from '../../api';
import PaginateError from './PaginateError';


const PaginateScroll = ({ url, items, callback }) => {

    // hooks
    const reachedPageBottom = usePageBottom();

    // state
    const [nextUrl, setNextUrl] = useState(url);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);


    const callApi = async () => {
        setLoading(true);

        // make request
        const response = await apiGetUrl(nextUrl);

        // handle success
        if (response.ok) {
            const data = await response.json();
            // set next url
            setNextUrl(data["next"]);

            // call callback function
            callback(items.concat(data.results));

            // update loading and error state
            setError(false);
            setLoading(false);
        }

        // handle error
        else {
            console.error(response);
            setError(true);
            setLoading(false);
        }
    };


    // update state when url changes
    useEffect(() => {
        setNextUrl(url);
    }, [url]);


    /*
     * Paginate when page bottom is reached.
     */
    useEffect(() => {
        if (reachedPageBottom && nextUrl !== null && loading === false && error === false) {
            callApi();
        }
    }, [reachedPageBottom, nextUrl, loading, error]);


    // render
    return (
        nextUrl === null
            ? <></>
            : loading === true
                ? <Spinner animation="border" className="my-3" />
                : error === true
                    ? <PaginateError retryAction={callApi} />
                    : <></>
    );
}


export default PaginateScroll;
