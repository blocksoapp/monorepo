import { Container } from "react-bootstrap";
import PostPlaceholder from './PostPlaceholder';


function PostsPlaceholder() {
    return (
        <Container className="mt-4">
            <PostPlaceholder />
            <PostPlaceholder />
            <PostPlaceholder />
        </Container>
    )
}

export default PostsPlaceholder;
