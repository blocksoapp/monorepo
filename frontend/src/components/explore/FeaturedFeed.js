import { Container } from "react-bootstrap";
import FeedProfile from "../feed/read/FeedProfile";
import Feed from "../feed/read/Feed";


function FeaturedFeed({feedId}) {

    // render
    return (
        <Container>
            <FeedProfile feedId={feedId} />
            <Feed id={feedId} paginateByButton={true} />
        </Container>
    )
}

export default FeaturedFeed;
