import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

export default class Play extends React.Component<RouteComponentProps<{}>, {}> {
    public render() {
        return <div>
            <div>&nbsp;</div>
            <div>
                <div>&nbsp;</div>
                <div>
                    User..........<input type="text" id="userInput" />
                    <br />
                    Message...<input type="text" id="messageInput" />
                    <input type="button" id="sendButton" value="Send Message" />
                </div>
            </div>
            <div>
                <div>
                    <hr />
                </div>
            </div>
            <div>
                <div>&nbsp;</div>
                <div>
                    <ul id="messagesList"></ul>
                </div>
            </div>
        </div>;
    }
}
