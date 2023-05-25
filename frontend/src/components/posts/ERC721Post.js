import { useEffect, useState } from "react";
import { Card, Col, Collapse, Image, Row } from "react-bootstrap";
import Lightbox from "react-image-lightbox";
import TxAddress from "../TxAddress";
import ERC721ThumbAndCaption from "./ERC721ThumbAndCaption";
import EtherscanLogo from "../../assets/img/etherscan.svg";
import OpenseaLogo from "../../assets/img/opensea.svg";


function ERC721Post({author, transfers, txHash}) {

    // state
    const [ tokenImagesThumb, setTokenImagesThumb] = useState([]);
    const [ tokenImagesFull, setTokenImagesFull] = useState([]);
    const [ galleryIndex, setGalleryIndex ] = useState(0);
    const [ showGallery, setShowGallery ] = useState(false);
    const [ showMoreItems, setShowMoreItems ] = useState(false);


    /*
     * Initialize the tokenImagesThumb and tokenImagesFull
     * arrays to be the same size as transfers, and fill
     * them with empty strings.
     *
     * This allows the child component ERC721Thumb to then
     * dynamically fill the urls of each token that was
     * transferred, while maintaining the order of the
     * gallery viewer.
     */
    useEffect(() => {
        var empty = new Array(transfers.length).fill('');
        setTokenImagesFull(empty);
        setTokenImagesThumb(empty);
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

            {/* links to view on opensea and etherscan */}
            <Row className="justify-content-end fs-6">
                {/* opensea */}
                <Col className="col-auto pe-0">
                    <a href={`https://opensea.io/assets/ethereum/${transfers[0].contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={OpenseaLogo}
                            height="20px"
                            width="20px"
                        />
                    </a>
                </Col>
                {/* etherscan */}
                <Col className="col-auto">
                    <a href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={EtherscanLogo}
                            height="20px"
                            width="20px"
                        />
                    </a>
                </Col>
            </Row>

            {/* nft thumbnail, id, and recipient */}
            <ERC721ThumbAndCaption
                key={0}
                author={author}
                transfer={transfers[0]}
                index={0}
                setGalleryIndex={setGalleryIndex}
                setShowGallery={setShowGallery}
                tokenImagesThumb={tokenImagesThumb}
                setTokenImagesThumb={setTokenImagesThumb}
                tokenImagesFull={tokenImagesFull}
                setTokenImagesFull={setTokenImagesFull}
            />

            {/* if there is more than one transfer in a transaction */}
            {transfers.length > 1 &&
                <div className="text-center my-2">
                    <span
                        style={{
                            cursor: "pointer",
                            textDecoration: "underline 1px dotted"
                        }}
                        onClick={() => setShowMoreItems(!showMoreItems)}
                    >
                        { showMoreItems ? "Show less items" : "Show more items" }
                    </span>
                </div>
            }

            {transfers.length > 1 &&
                <Collapse in={showMoreItems}>
                    <div>
                        {transfers.map((transfer, index) => {
                            // skip the 0th one since it is handled above
                            if (index == 0) return 

                            return (
                                <ERC721ThumbAndCaption
                                    className="mt-5"
                                    key={index}
                                    author={author}
                                    transfer={transfer}
                                    index={index}
                                    setGalleryIndex={setGalleryIndex}
                                    setShowGallery={setShowGallery}
                                    tokenImagesThumb={tokenImagesThumb}
                                    setTokenImagesThumb={setTokenImagesThumb}
                                    tokenImagesFull={tokenImagesFull}
                                    setTokenImagesFull={setTokenImagesFull}
                                />
                            )
                        })}
                    </div>
                </Collapse>
            }
        </Card.Body>
    )
}

export default ERC721Post;
