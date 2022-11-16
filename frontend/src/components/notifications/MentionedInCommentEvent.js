import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import EnsAndAddress from "../EnsAndAddress.js";
import PfpResolver from "../PfpResolver";


function MentionedInCommentEvent({data, setHref}) {

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
                        address={data.mentionedBy.address}
                        imgUrl={data.mentionedBy.image}
                        height="40px"
                        width="40px"
                        fontSize="0.5rem"
                    />
                </Col>

                {/* event description */}
                <Col xs={10} className="ps-3">
                    <span>
                        <EnsAndAddress address={data.mentionedBy.address} />
                        &nbsp; mentioned you in a comment!
                    </span>
                </Col>
            </Row>
        </Container>
    )
}


export default MentionedInCommentEvent;
