import { Alert, Button } from "react-bootstrap";


function PaginateError({retryAction}) {

    return (
        <Alert variant="danger">
            Sorry, something went wrong.
            <Button
                size="sm"
                variant="outline-primary"
                className="float-end"
                onClick={retryAction}
            >
                Retry
            </Button>
        </Alert>
    )
}


export default PaginateError;
