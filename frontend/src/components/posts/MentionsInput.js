/*
 * Wraps the react-mentions MentionsInput for Blockso's purposes.
 */
import { MentionsInput as ReactMentionsInput, Mention } from "react-mentions";
import { abbrAddress } from "../../utils";
import { apiGetSuggestedUsers } from "../../api";
import "./mentions-custom.css";

function MentionsInput({ placeholder, text, setText, setTaggedUsers }) {
  /*
   * Requests a list of users that start with the given query.
   * Calls callback with the results of the response.
   */
  const fetchSuggestedUsers = async (query, callback) => {
    const resp = await apiGetSuggestedUsers(query);
    if (resp.ok) {
      const results = (await resp.json()).results;
      var formatted = results.map((user) => ({
        display: `@0x${abbrAddress(user.address)}`,
        id: user.address,
      }));

      // include @everyone when the user starts to type
      if ("everyone".startsWith(query)) {
        formatted.unshift({ display: "@everyone", id: "everyone" });
      }
      return callback(formatted);
    }
  };

  /*
   * Parses user addresses from the input's text.
   * Returns an array of user addresses.
   */
  const parseTaggedUsers = (inputText) => {
    // look for mentions pattern and capture the address
    // mentions pattern: @[__display__](__0xaddress__)
    const regexp = /@\[@[\w\.]*\]\((0x\w{40}|everyone)\)/gim;
    const matches = [...inputText.matchAll(regexp)];

    // create array of mentioned user addresses
    var addresses = [];
    for (const match of matches) {
      addresses.push(match[1]);
    }

    setTaggedUsers(addresses);
  };

  return (
    <ReactMentionsInput
      className="form-control"
      style={{ height: "100px" }}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        parseTaggedUsers(event.target.value);
      }}
      placeholder={placeholder}
    >
      <Mention trigger="@" data={fetchSuggestedUsers} appendSpaceOnAdd={true} />
    </ReactMentionsInput>
  );
}

export default MentionsInput;
