import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import EnsAndAddress from "../../EnsAndAddress.js";
import PfpResolver from "../../PfpResolver";


function LikedCommentEvent({data, setHref}) {

    // constants
    const href = `/posts/${data.post}#${data.comment}`;

    // effects
    useEffect(() => {
        setHref(href);
    }, []);

    return (
        <Container>
            <Row className="align-items-center">
                {/* avatar */}
                <Col xs={2}>
                    <PfpResolver
                        address={data.likedBy.address}
                        imgUrl={data.likedBy.image}
                        height="40px"
                        width="40px"
                        fontSize="0.5rem"
                    />
                </Col>

                {/* event description */}
                <Col xs={10} className="ps-3">
                    <span>
                        <EnsAndAddress address={data.likedBy.address} />
                        &nbsp;liked your comment!
                    </span>
                </Col>
            </Row>
        </Container>
    )
}


export default LikedCommentEvent;
