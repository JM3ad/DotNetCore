import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import * as LobbyStore from '../store/Lobby';
import { ApplicationState } from '../store';
import { NavLink, Link } from 'react-router-dom';
import { Component } from 'react';

type LobbyProps =
    LobbyStore.LobbyState
    & typeof LobbyStore.actionCreators
    & RouteComponentProps<{}>;

interface LobbyState {
    currentLobbyText: string;
    message: string;
}

class Lobby extends React.Component<LobbyProps, LobbyState> {

    constructor(props: LobbyProps) {
        super(props);
        this.state = { currentLobbyText: '', message: '' };
        this.handleLobbyTextUpdate = this.handleLobbyTextUpdate.bind(this);
        this.handleMessageUpdate = this.handleMessageUpdate.bind(this);
        this.props.startListening();
    }

    componentDidUpdate() {
        if (this.props.hasGameStarted) {
            this.props.history.push('/game');
        }
    }

    public render() {
        return <div>
            {this.renderLobbyCode()}
            {this.renderLobby()}
        </div>;          
    }

    private renderLobbyCode() {
        return <div>
            <p>Game Code: <span id="lobbyCode">{this.props.lobby}</span></p>
        </div>;
    }

    private renderLobby() {
        if (this.props.hasJoinedLobby) {
            return <div>
                <input type="button" id="leaveLobbyButton" onClick={() => { this.props.leaveLobbyRequest(this.props.lobby) }} value="Leave Lobby" />
                <input type="button" id="startGameButton" onClick={() => { this.props.startGame(this.props.lobby) }} value="Start Game" />
                {this.renderInLobby()}
            </div>;
        }
        return <div>{this.renderOutOfLobby()}</div>;
    }

    private renderOutOfLobby() {
        return <div>
            Lobby: <input type="text" id="lobbyInput" value={this.state.currentLobbyText} onChange={this.handleLobbyTextUpdate} />
            <input type="button" id="joinLobbyButton" onClick={() => { this.props.joinLobbyRequest(this.state.currentLobbyText) }} value="Join Lobby" />
            <input type="button" id="createLobbyButton" onClick={() => { this.props.createLobbyRequest() }} value="Create Lobby" />
        </div>
    }

    private renderInLobby() {
        return <div>
                <div>
                    {this.renderGameOptions()}
                </div>
            <div id="message-container">
                {this.props.messages.map((message, i) => {
                    return <p>{message}</p>
                })}
            </div>
            Message: <input type="text" id="messageInput" value={this.state.message} onChange={this.handleMessageUpdate} />
            <input type="button" id="sendMessageButton" onClick={() => { this.sendMessage() }} value="Send" />
            </div>
    }

    private renderGameOptions() {
        return <div></div>
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
    (state: ApplicationState) => state.lobby, // Selects which state properties are merged into the component's props
    LobbyStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Lobby) as typeof Lobby;