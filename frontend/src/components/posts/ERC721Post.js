import { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import Lightbox from "react-image-lightbox";
import TxAddress from "../TxAddress";
import ERC721Thumb from "./ERC721Thumb";


function ERC721Post({transfers}) {

    // state
    const [ tokenImagesThumb, setTokenImagesThumb] = useState([]);
    const [ tokenImagesFull, setTokenImagesFull] = useState([]);
    const [ galleryIndex, setGalleryIndex ] = useState(0);
    const [ showGallery, setShowGallery ] = useState(false);


    /*
     * Fetch an image for each token in transfers.
     */
    useEffect(() => {
        if (transfers.length == 0) return;  // do nothing if transfers is empty

        // request token images from opensea
        // TODO eventually should get an API key and move this to the backend
        const fetchTokenImages = async () => {
            var thumbUrls = [];
            var fullUrls = [];

            // fetch image for each transferred token
            for (var transfer of transfers) {
                // get asset url from opensea
                var url = `https://api.opensea.io/api/v1/asset/${transfer.contract_address}/${transfer.token_id}/`
                var resp = await fetch(url);
                var json = await resp.json();

                thumbUrls.push(json["image_thumbnail_url"]);
                fullUrls.push(json["image_url"]);
            }
            
            setTokenImagesThumb(thumbUrls);
            setTokenImagesFull(fullUrls);
        }

        fetchTokenImages();
    }, [transfers])


    return (
        transfers.length > 0 &&
        <Card.Body>
            {/* lightbox gallery showing all transfers of a transaction */}
            {showGallery && (
                <Lightbox
                    mainSrc={tokenImagesFull[galleryIndex]}
                    mainSrcThumbnail={tokenImagesThumb[galleryIndex]}
                    nextSrc={tokenImagesFull[(galleryIndex + 1) % tokenImagesFull.length]}
                    nextSrcThumbnail={tokenImagesThumb[(galleryIndex + 1) % tokenImagesThumb.length]}
                    prevSrc={tokenImagesFull[(galleryIndex + tokenImagesFull.length - 1) % tokenImagesFull.length]}
                    prevSrcThumbnail={tokenImagesThumb[(galleryIndex + tokenImagesThumb.length - 1) % tokenImagesThumb.length]}
                    onCloseRequest={() => setShowGallery(false)}
                    onMovePrevRequest={() => setGalleryIndex(
                        (galleryIndex + tokenImagesFull.length - 1) % tokenImagesFull.length
                    )}
                    onMoveNextRequest={() => setGalleryIndex(
                        (galleryIndex + 1) % tokenImagesFull.length
                    )}
                    imageTitle={`${transfers[galleryIndex].contract_name} #${transfers[galleryIndex].token_id}`}
                />
            )}

            {/* card body details, shows nft thumbnail, id, and recipient */}
            {transfers.map((transfer, index) => (
                <Row key={index} className="p-2 text-center align-items-center">
                    {/* nft thumbnail */}
                    <Col xs={4}>
                        <ERC721Thumb
                            fluid rounded
                            src={tokenImagesThumb[index]}
                            onClick={() => {
                                setShowGallery(true);
                                setGalleryIndex(index);
                            }}
                            style={{ cursor: "pointer" }}
                        />
                    </Col>

                    {/* nft token id and recipient of the transfer */}
                    <Col xs={8}>
                        <Card.Text className="fs-5">
                            Sent&nbsp;
                            <a
                                className="text-success"
                                href={`https://opensea.io/assets/ethereum/${transfer.contract_address}/${transfer.token_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontStyle: 'italic', color: 'black' }}
                            >
                                {transfer.contract_ticker} #{transfer.token_id}
                            </a>
                            <br/>
                            to&nbsp;
                            <TxAddress address={transfer.to_address} />
                        </Card.Text>
                    </Col>
                </Row>
            ))}
        </Card.Body>
    )
}

export default ERC721Post;
