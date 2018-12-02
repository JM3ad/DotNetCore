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
        return <div>
                <h3 className="text-center">Gather your war council</h3>
                {this.props.hasJoinedLobby ? this.renderInLobby() : this.renderOutOfLobby()}
        </div>;
    }

    private renderInLobby() {
        return <div>
            <div className="row">
                {this.renderLobbyCode()}
            </div>
            <br />
            <div className="row">
                <div className="col-sm-3"></div>
                <div className="col-sm-6">
                    {this.renderPlayerList()}
                </div>
                <div className="col-sm-3"></div>
            </div>
            <br />
            <div className="row">
                <input type="button" id="startGameButton" className="btn" onClick={() => { this.props.callbackHandler({ type: 'START_GAME', lobby: this.props.lobbyCode }) }} value="Start Game" />
            </div>
            <br />
            <div className="row">
                <input type="button" id="leaveLobbyButton" className="btn" onClick={() => { this.props.callbackHandler({ type: 'LEAVE_LOBBY', lobby: this.props.lobbyCode }) }} value="Leave Lobby" />
            </div>
            </div>;
    }

    private renderOutOfLobby() {
        return <div>
            <br />
            <div className="row">
                <input type="button" className="btn" id="createLobbyButton" onClick={() => { this.props.callbackHandler({ type: 'CREATE_LOBBY_REQUEST' }) }} value="Create New Game" />
            </div>
            <br />
            <br />
            <div className="row">
                <input type="text" id="lobbyInput" className="form-control" value={this.state.currentLobbyText} onChange={this.handleLobbyTextUpdate} placeholder="Lobby Code" />
                <input type="button" className="btn" id="joinLobbyButton" onClick={() => { this.props.callbackHandler({ type: 'JOIN_LOBBY_REQUEST', lobby: this.state.currentLobbyText }) }} value="Join Game" />
            </div>
        </div>;
    }

    private renderPlayerList() {
        return <div>
            <ol>
                <li>Player 1</li>
                <li>Player 2</li>
                <li>Player 3</li>
                <li>Player 4</li>
            </ol>
            </div>
    }

    private renderLobbyCode() {
        return <div>
            <h4>Game Code: <span id="lobbyCode">{this.props.lobbyCode}</span></h4>
        </div>;
    }

    private handleLobbyTextUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ currentLobbyText: event.currentTarget.value });
    }
}