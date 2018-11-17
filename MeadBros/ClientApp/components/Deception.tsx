import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import * as DeceptionStore from '../store/Deception';
import { ApplicationState } from '../store';
import { Direction } from '../store/Deception';

export type DeceptionProps =
    DeceptionStore.DeceptionState
    & typeof DeceptionStore.actionCreators
    & RouteComponentProps<{}>;

interface DeceptionState {
    lobbyCode: string,
    currentLobbyText: string
}

class Deception extends React.Component<DeceptionProps, DeceptionState> {

    constructor(props: DeceptionProps) {
        super(props);
        this.state = { currentLobbyText: '', lobbyCode: '' };
        this.handleLobbyTextUpdate = this.handleLobbyTextUpdate.bind(this);
        this.props.startListening();
    }

    public render() {
        if (!this.props.gameHasStarted) {
            return <div>
                {this.renderLobby()}
            </div>
        }
        return <div>
            {this.renderGame()}
        </div>
    }
    
    private renderGame() {
        return <div>
            {this.renderHeader()}
            {this.renderUndercover()}
            {this.renderAmbushPlan()}
            {this.renderAmbushSuccess()}
            {this.renderHint()}
            {this.renderVoteButtons()}
            {this.renderResult()}
            </div>
    }

    private renderHeader() {
        const dayNumber = this.props.game.roundsCompleted + 1;
        return <div><h3>Day {dayNumber}</h3>
            <p>You gather with the other captains to plan for the night to come</p>
        </div>;
    }

    private renderHint() {
        if (!!this.props.game.hint) {
            return <div>Your source is almost certain. "{this.props.game.hint}" he tells you.</div>;
        }
    }

    private renderResult() {
        if (this.props.game.gameOver) {
            return <div>
                Captains won: {this.props.game.gameResult}
                <input type="button" id="endGame" onClick={() => { this.props.returnToLobby(this.props.lobby.lobbyCode) }} value="Return To Lobby" />
            </div>;
        }
    }

    private renderAmbushPlan() {
        var night = this.props.game.hasVotedThisRound ?
            this.props.game.roundsCompleted + 1 :
            this.props.game.roundsCompleted;
        if (this.props.game.voteResult.length > 0) {
            return <div>Night {this.props.game.roundsCompleted }: We will ambush the following routes:
                <ul>
                    {this.props.game.voteResult.map((result, i) => {
                        return <li> {Direction[result]}</li>;
                    })}
                </ul>
            </div>
        }
        return <div></div>
    }

    private renderAmbushSuccess() {
        if (this.props.game.roundsCompleted > 0) {
            var result = this.props.game.ambushWasSuccess ?
                "Our men returned victorious. Those orcs had no idea what was coming" :
                "I don't know how we survived the night. They clearly bypassed our men entirely";
            return <div>
                <p>You gather with the other commanders to review the results of last night</p>
                <p>{result}</p>
            </div>
        }
        return <div></div>
    }

    private renderUndercover() {
        if (this.props.game.isUndercover) {
            return <div><b>Unbeknownst to the others, you have sold yourself to Sauron, in exchange for your familys safety.</b>
                <p>Be careful, for the Dark Lord does not suffer failure </p>
            </div>
        }
        return <div>You are a loyal captain of the guard, do your best to hold off this onslaught.</div>
    }

    private renderVoteButtons() {
        if (!this.props.game.hasVotedThisRound) {
            return <div>
                <div>When you're ready, submit your vote for which routes to ambush. The top two choices will be selected.</div>
                <input type="button" id="voteNorth" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.North) }} value="North" />
                <input type="button" id="voteEast" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.East) }} value="East" />
                <input type="button" id="voteSouth" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.South) }} value="South" />
                <input type="button" id="voteWest" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.West) }} value="West" />
            </div>
        }
    }

    private renderLobbyCode() {
        return <div>
            <p>Game Code: <span id="lobbyCode">{this.props.lobby.lobbyCode}</span></p>
        </div>;
    }

    private renderLobby() {
        if (this.props.lobby.hasJoinedLobby) {
            return <div>
                {this.renderLobbyCode()}
                <input type="button" id="leaveLobbyButton" onClick={() => { this.props.leaveLobbyRequest(this.props.lobby.lobbyCode) }} value="Leave Lobby" />
                <input type="button" id="startGameButton" onClick={() => { this.props.startGame(this.props.lobby.lobbyCode) }} value="Start Game" />
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

    private handleLobbyTextUpdate(event: React.FormEvent<HTMLInputElement>) {
        this.setState({ currentLobbyText: event.currentTarget.value });
    }
}

export default connect(
    (state: ApplicationState) => state.deception, // Selects which state properties are merged into the component's props
    DeceptionStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Deception) as typeof Deception;