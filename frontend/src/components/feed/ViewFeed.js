import { useParams } from "react-router-dom"; 
import { Container } from "react-bootstrap";
import BackToFeedsButton from "./BackToFeedsButton";
import FeedProfile from "./FeedProfile";
import Feed from "./Feed";


function ViewFeed() {
    // hooks
    const { feedId } = useParams();

    // render
    return (
        <Container>
            <BackToFeedsButton />
            <FeedProfile feedId={feedId} />
            <Feed id={feedId} />
        </Container>
    )
}

export default ViewFeed;
