/*
 * Thumbnail image that shows a spinner
 * while the image is loading.
 */
import { useEffect, useState } from "react";
import { Image, Spinner } from "react-bootstrap";
import ERC721ThumbError from "./ERC721ThumbError";


function ERC721Thumb({
    transfer, index, setGalleryIndex, setShowGallery,
    tokenImagesThumb, tokenImagesFull,
    setTokenImagesThumb, setTokenImagesFull
}) {

    // state
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);


    // used to abort pending requests on component unmount
    const fetchController = new AbortController();


    /*
     * Fetch URL of token image using Opensea API.
     * Set the state of the parent components on success.
     * Set isError to true on error, at which point the user can retry.
     * TODO should get an API key and move this to the backend
     *  once we have enough usage.
     */
    const fetchTokenImage = async () => {
        setIsError(false);
        setIsLoading(true);

        // get asset url from opensea
        var url = `https://api.opensea.io/api/v1/asset/${transfer.contract_address}/${transfer.token_id}/`
        var resp = await fetch(url, {signal: fetchController.signal});

        // give the user option to retry in case of error
        if (!resp.ok) {
            setIsError(true);
            setIsLoading(false);
        }
        resp = await resp.json();

        // insert asset url into parent components' state - needed to display gallery
        var newThumbImgs = tokenImagesThumb
        newThumbImgs.splice(index, 0, resp["image_thumbnail_url"]);
        var newFullImgs = tokenImagesFull
        newFullImgs.splice(index, 0, resp["image_url"]);

        setTokenImagesThumb(newThumbImgs);
        setTokenImagesFull(newFullImgs);
        setIsError(false);
        setIsLoading(false);
    }


    /*
     * Fetch image url using Opensea API on component mount.
     * Set the state of the parent components on success.
     * Set isError to true on error, at which point the user can retry.
     */
    useEffect(() => {
        // do nothing if index is not given
        if (index === null || index === undefined) return;
        if (!transfer) return;  // do nothing if transfer is not given

        // get the image of the transferred token
        fetchTokenImage();

        // clean up any pending request on unmount
        return () => {
            fetchController.abort();
        }

    }, [transfer])


    return (
        isError
            ? <ERC721ThumbError retryAction={fetchTokenImage} />
            : isLoading
                ? <Spinner animation="border" className="img-fluid mt-5" />
                :   <Image
                        fluid
                        thumbnail
                        src={tokenImagesThumb[index]}
                        onClick={() => {
                            setGalleryIndex(index);
                            setShowGallery(true);
                        }}
                        style={{
                            cursor: "pointer",
                            boxShadow: "0px 2px 10px 0px rgba(0, 0, 0, 0.5)",
                        }}
                    />
    )
}


export default ERC721Thumb;
