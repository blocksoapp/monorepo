import { Container } from "react-bootstrap";
import FeedProfile from "../feed/read/FeedProfile";
import Feed from "../feed/read/Feed";
import "../feed/feed.css";

function FeaturedFeed({ feed }) {
  const feedId =
    feed.length > 0 ? feed[Math.floor(Math.random() * feed.length)].id : null;

  // render
  return (
    <Container>
      {feedId ? (
        <>
          <FeedProfile feedId={feedId} />
          <Feed id={feedId} paginateByButton={true} />
        </>
      ) : (
        <p className="text-center">No items in feed..</p>
      )}
    </Container>
  );
}

export default FeaturedFeed;
