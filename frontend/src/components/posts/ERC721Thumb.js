/*
 * Thumbnail image that shows a spinner
 * while the image is loading.
 */
import { useState } from "react";
import { Image, Spinner } from "react-bootstrap";


function ERC721Thumb(props) {

    // state
    const [isLoading, setIsLoading] = useState(true);


    return (
        <>
            {isLoading && <Spinner animation="border" className="img-fluid" />}
            <Image
                {...props}
                onLoad={() => setIsLoading(false)}
                style={{ ...props.style, display: isLoading ? "none" : "" }} />
        </>
    )
}


export default ERC721Thumb;
