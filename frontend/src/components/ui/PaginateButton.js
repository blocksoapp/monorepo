/*
 * A react functional component that takes in a url and a callback function.
 */
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { apiGetUrl } from '../../api';
import PaginateError from './PaginateError';


const PaginateButton = ({ url, items, callback, text, variant }) => {

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


    // render
    return (
        nextUrl === null
            ? <></>
            : loading === true
                ? <Button variant={variant} disabled>Loading...</Button>
                : error === true
                    ? <PaginateError retryAction={callApi} />
                    : <Button variant={variant} onClick={callApi}>{text}</Button>
    );
}


export default PaginateButton;
