import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import * as DeceptionStore from '../store/Deception';
import { ApplicationState } from '../store';
import { Direction, Stage } from '../store/Deception';
import Lobby from './Lobby';
import { KnownLobbyAction } from '../store/Lobby';

export type DeceptionProps =
    DeceptionStore.DeceptionState
    & typeof DeceptionStore.actionCreators
    & RouteComponentProps<{}>;

interface DeceptionState {}

class Deception extends React.Component<DeceptionProps, DeceptionState> {

    constructor(props: DeceptionProps) {
        super(props);
        this.props.startListening();
    }

    public render() {
        if (!this.props.gameHasStarted) {
            return <div>
                <Lobby callbackHandler={this.lobbyCallbackHandler} hasJoinedLobby={this.props.lobby.hasJoinedLobby} lobbyCode={this.props.lobby.lobbyCode} />
            </div>
        }
        return <div>
            {this.renderGame()}
        </div>
    }

    lobbyCallbackHandler = (action: KnownLobbyAction) => {
        this.props.dispatchLobbyChange(action);
    }
    
    private renderGame() {
        if (this.props.game.gameOver) {
            return <div>
                {this.renderHeader()}
                {this.renderAmbushPlan()}
                {this.renderAmbushSuccess()}
                {this.renderResult()}
            </div>;
        }
        return <div>
            {this.renderHeader()}
            {this.renderUndercover()}
            {this.renderAmbushPlan()}
            {this.renderAmbushSuccess()}
            {this.renderHint()}
            {this.renderVoteButtons()}
            </div>
    }

    private renderHeader() {
        const dayNumber = this.props.game.roundsCompleted + 1;
        return <div><h3>Day {dayNumber}</h3>
            <p>You gather with the other captains to plan for the night to come</p>
        </div>;
    }

    private renderHint() {
        return <div>Your source is almost certain. "{this.props.game.hint}" he tells you.</div>;
    }

    private renderResult() {
        const playerWinText = this.props.game.gameResult != this.props.game.isUndercover ?
            'You won.' :
            'You lost.' ;
        const outcomeText = this.props.game.gameResult ?
            'Word has arrived from Minas Tirith; preparations for war are ready. Our endurance here will surely be remembered.' :
            'The orcs have overwhelmed Osgiliath, and are already moving onwards towards the capital; great suffering awaits the people of Gondor.'
        return <div>
                <div>{playerWinText}</div>
                <div>{outcomeText}</div>
                <div><input type="button" id="endGame" onClick={() => { this.props.returnToLobby(this.props.lobby.lobbyCode) }} value="Return To Lobby" /></div>
            </div>
    }

    private renderAmbushPlan() {
        if (this.props.game.voteResult.length == 0) {
            return <div></div>
        }
        return this.props.game.stage == Stage.Voting || Stage.WaitingForVotes ?
            <div>
                Last Night we ambushed following routes:
                <ul>
                    {this.props.game.voteResult.map((result, i) => {
                        return <li> {Direction[result]}</li>;
                    })}
                </ul>
            </div> :
            <div>
                The lots have been drawn. Tonight we ambush:
                <ul>
                    {this.props.game.voteResult.map((result, i) => {
                        return <li> {Direction[result]}</li>;
                    })}
                </ul>
            </div>;
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
}

export default connect(
    (state: ApplicationState) => state.deception, // Selects which state properties are merged into the component's props
    DeceptionStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Deception) as typeof Deception;