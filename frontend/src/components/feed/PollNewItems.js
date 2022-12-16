import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";


function PollNewItems({apiFunction, interval, oldItems, callback}) {

    /*
     * Polls the given apiFunction every interval.
     * Displays an alert if there are new items.
     *
     * Accepts: 
     *  - an interval
     *  - a function to poll against
     *  - a list of items to compare new items to
     *  - a callback function.
     */

    // state
    const [items, setItems] = useState(oldItems);
    const [hasNewItems, setHasNewItems] = useState(false);

    // functions
    
    /*
     * Calls the apiFunction.
     * Sets items to the result of the apiFunction.
     */
    const pollForNewItems = async () => {
        const resp = await apiFunction();
        const data = await resp.json();
        setItems(data["results"]);
    }

    // effects

    /*
     * Compares new items to old items, and
     * sets hasNewItems if the first element
     * of each list do not match.
     */
    useEffect(() => {
        // do nothing if there is nothing to compare
        if (!oldItems) return;
        if (!items) return;

        // compare new items to old items
        if (JSON.stringify(items[0]) !== JSON.stringify(oldItems[0])) {
            setHasNewItems(true);
        }
    }, [items])


    /* Runs on component mount.
     * Calls apiFunction every interval.
     * Cleans up the interval function on
     * component unmount.
     */
    useEffect(() => {
        // poll every interval
        const intervalObj = setInterval(
            () => pollForNewItems(),
            interval
        );

        // clean up inverval on unmount
        return () => {
            clearInterval(intervalObj);
        }
    }, [])


    return (
        hasNewItems
            ?   <Container>
                    <Row className="justify-content-center p-5">
                        <Col xs={10} lg={6}>
                            <Alert variant="primary">
                                There are new items in your feed!
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="float-md-end mt-3 mt-md-0"
                                    onClick={() => {
                                        callback();
                                        setHasNewItems(false);
                                    }}
                                >
                                    Refresh
                                </Button>
                            </Alert>
                        </Col>
                    </Row>
                </Container>
            :   <></>
    )
}


export default PollNewItems;
