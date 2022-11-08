import { Container, Placeholder } from "react-bootstrap";


function NotificationsPlaceholder() {
    return (
        <Container>
            <Placeholder animation="wave">
                <Placeholder xs={12} />
                <Placeholder xs={12} />
                <Placeholder xs={12} />
            </Placeholder>
        </Container>
    )
}

export default NotificationsPlaceholder;
