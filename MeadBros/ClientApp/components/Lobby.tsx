import * as React from 'react';
import * as LobbyStore from '../store/Lobby';

export type LobbyProps = LobbyStore.LobbyState;

interface LocalLobbyState {
    currentLobbyText: string,
    currentNameText: string
}

export default class Lobby extends React.Component<LobbyProps, LocalLobbyState> {

    constructor(props: LobbyProps) {
        super(props);
        this.state = { currentLobbyText: '', currentNameText: '' };
        this.handleLobbyTextUpdate = this.handleLobbyTextUpdate.bind(this);
        this.handleNameUpdate = this.handleNameUpdate.bind(this);
    }

    public render() {
        return <div>
                <h3 className="text-center">Gather your war council</h3>
                { !this.props.name ? this.renderEnterName() :
                    this.props.hasJoinedLobby ? this.renderInLobby() : this.renderOutOfLobby()
                }
        </div>;
    }

    private renderEnterName() {
        return <div>
            <div className="row">
                <input type="text" className="form-control" value={this.state.currentNameText} onChange={this.handleNameUpdate} placeholder="Name" />
                <input type="button" className="btn" onClick={() => { this.setName() }} value="Enter Name" />
            </div>
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
                {this.props.players.map((playerName) => {
                    return <li>{playerName}</li>
                })}
            </ol>
            </div>
    }

    private renderLobbyCode() {
        return <div>
            <h4>Game Code: <span id="lobbyCode">{this.props.lobbyCode}</span></h4>
        </div>;
    }

    private setName() {
        if (this.state.currentNameText) {
            this.props.callbackHandler({ type: 'SET_NAME', name: this.state.currentNameText });
        }
    }

    private handleLobbyTextUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ currentLobbyText: event.currentTarget.value });
    }

    private handleNameUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ currentNameText: event.currentTarget.value });
    }
}