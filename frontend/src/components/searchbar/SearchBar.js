import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./searchbar.css";

function SearchBar() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = () => {
    const route = `${searchVal.trim()}/profile`;
    navigate(route);
    setSearchVal(""); // clear input
  };

  const onKeyPress = (event) => {
    // search when user presses enter
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <InputGroup>
      <Form.Control
        type="text"
        placeholder="Search ENS or address"
        value={searchVal}
        onChange={(event) => {
          setSearchVal(event.target.value);
        }}
        onKeyPress={onKeyPress}
      />
      <Button variant="outline-secondary" onClick={handleSearch}>
        <FontAwesomeIcon icon={faSearch} />
      </Button>
    </InputGroup>
  );
}

export default SearchBar;
