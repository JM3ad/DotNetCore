import * as React from 'react';
import * as LobbyStore from '../store/Lobby';

export type LobbyProps = LobbyStore.LobbyState;

interface LocalLobbyState {
    currentLobbyText: string
}

export default class Deception extends React.Component<LobbyProps, LocalLobbyState> {

    constructor(props: LobbyProps) {
        super(props);
        this.state = { currentLobbyText: ''};
        this.handleLobbyTextUpdate = this.handleLobbyTextUpdate.bind(this);
    }

    public render() {
        if (this.props.hasJoinedLobby) {
            return <div>
                {this.renderLobbyCode()}
                <input type="button" id="leaveLobbyButton" onClick={() => { this.props.callbackHandler({ type: 'LEAVE_LOBBY', lobby: this.props.lobbyCode }) }} value="Leave Lobby" />
                <input type="button" id="startGameButton" onClick={() => { this.props.callbackHandler({ type: 'START_GAME', lobby: this.props.lobbyCode }) }} value="Start Game" />
            </div>;
        }
        return <div>{this.renderOutOfLobby()}</div>;
    }

    private renderOutOfLobby() {
        return <div>
            Lobby: <input type="text" id="lobbyInput" value={this.state.currentLobbyText} onChange={this.handleLobbyTextUpdate} />
            <input type="button" id="joinLobbyButton" onClick={() => { this.props.callbackHandler({ type: 'JOIN_LOBBY_REQUEST', lobby: this.state.currentLobbyText }) }} value="Join Lobby" />
            <input type="button" id="createLobbyButton" onClick={() => { this.props.callbackHandler({ type: 'CREATE_LOBBY_REQUEST' }) }} value="Create Lobby" />
        </div>
    }

    private renderLobbyCode() {
        return <div>
            <p>Game Code: <span id="lobbyCode">{this.props.lobbyCode}</span></p>
        </div>;
    }

    private handleLobbyTextUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ currentLobbyText: event.currentTarget.value });
    }
}