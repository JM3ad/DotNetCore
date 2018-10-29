import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import * as GameStore from '../store/Game';
import { ApplicationState } from '../store';

type GameProps =
    GameStore.GameState
    & typeof GameStore.actionCreators
    & RouteComponentProps<{}>;

interface GameState {
    currentLobbyText: string;
    message: string;
}

class Play extends React.Component<GameProps, GameState> {

    constructor(props: GameProps) {
        super(props);
        this.state = { currentLobbyText: '', message: '' };
        this.handleLobbyTextUpdate = this.handleLobbyTextUpdate.bind(this);
        this.handleMessageUpdate = this.handleMessageUpdate.bind(this);
        this.props.startListening();
    }

    public render() {
        return <div>
            {this.renderLobbyCode()}
            {this.renderJoiningButtons()}
        </div>;          
    }

    private renderJoiningButtons() {
        if (this.props.hasJoinedLobby) {
            return <div>
                <input type="button" id="leaveLobbyButton" onClick={() => { this.props.leaveLobbyRequest(this.props.lobby) }} value="Leave Lobby" />
                {this.renderMessages()}
            </div>;
        }
        return <div>
            Lobby: <input type="text" id="lobbyInput" value={this.state.currentLobbyText} onChange={this.handleLobbyTextUpdate} />
            <input type="button" id="joinLobbyButton" onClick={() => { this.props.joinLobbyRequest(this.state.currentLobbyText) }} value="Join Lobby" />
            <input type="button" id="createLobbyButton" onClick={() => { this.props.createLobbyRequest() }} value="Create Lobby" />
        </div>
    }

    private renderMessages() {
        return <div>
            {this.props.messages.map((message, i) => {
                return <p>{message}</p>
            })}
            Message: <input type="text" id="messageInput" value={this.state.message} onChange={this.handleMessageUpdate} />
            <input type="button" id="sendMessageButton" onClick={() => { this.sendMessage() }} value="Send" />
            </div>
    }

    private renderLobbyCode() {
        return <div>
            <p>Lobby Code: <span id="lobbyCode">{this.props.lobby}</span></p>
        </div>;
    }

    private handleMessageUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ message: event.currentTarget.value });
    }

    private handleLobbyTextUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ currentLobbyText: event.currentTarget.value });
    }

    private sendMessage() {
        this.props.sendMessage(this.state.message, this.props.lobby);
        this.setState({ message: '' });;
    }
}

export default connect(
    (state: ApplicationState) => state.game, // Selects which state properties are merged into the component's props
    GameStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Play) as typeof Play;