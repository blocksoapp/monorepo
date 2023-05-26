import { useState } from "react";
import { Card, Col, Image, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { formatTokenAmount, zeroAddress } from "../../utils";
import TxAddress from "../TxAddress";
import EtherscanLogo from "../../assets/img/etherscan.svg";


function GenericTxPost({author, fromAddress, toAddress, txHash}) {

    return (
        <Card.Body>

            {/* link to view on etherscan */}
            <Row className="justify-content-end fs-6">
                <Col>
                    {author.toLowerCase() === fromAddress.toLowerCase()
                        ? <Card.Text>
                            Sent a transaction to <TxAddress address={toAddress} />
                          </Card.Text>
                        : <Card.Text>
                            Received a transaction from <TxAddress address={fromAddress} />
                          </Card.Text>
                    }
                </Col>
                <Col className="col-auto">
                    <a href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={EtherscanLogo}
                            height="20px"
                            width="20px"
                            className="mx-2"
                        />
                    </a>
                </Col>
            </Row>
        </Card.Body>
    )
}

export default GenericTxPost;
