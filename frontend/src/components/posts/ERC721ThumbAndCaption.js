/*
 * ERC721 Transfer Post content, which includes:
 *
 * 1. A thumbnail image that shows a spinner
 *    while the image is loading.
 *
 * 2. A caption that describes the ERC721 transfer.
 *
 */
import { useState } from "react";
import { Card, Col, Collapse, Row } from "react-bootstrap";
import TxAddress from "../TxAddress";
import ERC721Thumb from "./ERC721Thumb";


function ERC721ThumbAndCaption({
    className="", transfer, index, setGalleryIndex, setShowGallery,
    tokenImagesThumb, setTokenImagesThumb, tokenImagesFull, setTokenImagesFull
}) {

    return (
        <Row className={`text-center align-items-center ${className}`}>
            {/* nft thumbnail */}
            <Col xs={12}>
                <ERC721Thumb
                    transfer={transfer}
                    index={index}
                    setGalleryIndex={setGalleryIndex}
                    setShowGallery={setShowGallery}
                    tokenImagesThumb={tokenImagesThumb}
                    setTokenImagesThumb={setTokenImagesThumb}
                    tokenImagesFull={tokenImagesFull}
                    setTokenImagesFull={setTokenImagesFull}
                />
            </Col>

            {/* nft token id and recipient of the transfer */}
            <Col xs={12} className="mt-3 p-4">
                <Card.Text className="fs-5">
                    Sent&nbsp;
                    <a
                        href={`https://opensea.io/assets/ethereum/${transfer.contract_address}/${transfer.token_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style= {{
                            textDecoration: "underline 1px dotted",
                            fontStyle: 'italic',
                            color: 'black'
                        }}
                    >
                        {transfer.contract_ticker} #{transfer.token_id}
                    </a>
                    &nbsp;to&nbsp;
                    <TxAddress address={transfer.to_address} />
                </Card.Text>
            </Col>
        </Row>
    )
}


export default ERC721ThumbAndCaption;
