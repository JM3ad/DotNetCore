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
        //This protects against initial load race conditions when the props haven't yet been set
        if (!this.props.lobby) {
            return <div></div>;
        }
        return <div className="text-center">
            <div className="col-sm-2"></div>
            <div className="col-sm-8">
                {this.props.gameHasStarted ? this.renderGame() : this.renderLobby()}
            </div>
        </div>
    }

    private renderLobby() {
        return <Lobby
            callbackHandler={this.lobbyCallbackHandler}
            hasJoinedLobby={this.props.lobby.hasJoinedLobby}
            lobbyCode={this.props.lobby.lobbyCode}
            name={this.props.lobby.name}
            players={this.props.lobby.players}
        />
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
        return <div className="col-xs-12">
            <div className="col-xs-12">
                <div className="col-sm-3"></div>
                <h3 className="col-xs-12 col-sm-6">Day {dayNumber}</h3>
                <div className="col-sm-3">Fortification health remaining: {3 - this.props.game.attacksSustained}</div>
            </div>
            <div className="col-xs-12">
                <p>{!this.props.game.gameOver ? 'You gather with the other captains to plan for the night to come' : ''}</p>
            </div>
        </div>;
    }

    private renderHint() {
        return <div>Your source is almost certain:<br/><b>"{this.props.game.hint}"</b></div>;
    }

    private renderResult() {
        const playerWinText = this.props.game.gameResult != this.props.game.isUndercover ?
            'You won.' :
            'You lost.' ;
        const outcomeText = this.props.game.gameResult ?
            'Word has arrived from Minas Tirith; preparations for war are ready. Our endurance here will surely be remembered.' :
            'The orcs have overwhelmed Osgiliath, and are already moving onwards towards the capital; great suffering awaits the people of Gondor.'
        return <div>
                <div><b>{playerWinText}</b></div>
                <br/>
                <div>{outcomeText}</div>
                <br/>
                <div><input type="button" id="endGame" onClick={() => { this.props.returnToLobby(this.props.lobby.lobbyCode) }} value="Return To Lobby" /></div>
            </div>
    }

    private renderAmbushPlan() {
        if (this.props.game.voteResult.length == 0) {
            return <div></div>
        }
        return this.props.game.stage == Stage.Voting || Stage.WaitingForVotes ?
            <div>
                Last night we ambushed the following routes:
                {this.props.game.voteResult.map((result, i) => {
                    return <p>{Direction[result]}</p>
                })}
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
                <br />
                <div>When you're ready, submit your vote for which routes to ambush. The top two choices will be selected.</div>
                <br />
                <div className="col-xs-12">
                <input type="button" className="btn" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.North) }} value="North" />
                </div>
                <div className="col-xs-12">
                    <div className="col-xs-6 col-sm-4 col-sm-offset-2">
                        <input type="button" className="btn" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.West) }} value="West" />
                    </div>
                    <div className="col-xs-6 col-sm-4">
                        <input type="button" className="btn" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.East) }} value="East" />
                    </div>
                </div>
                <div className="col-xs-12">
                    <input type="button" className="btn" onClick={() => { this.props.vote(this.props.lobby.lobbyCode, DeceptionStore.Direction.South) }} value="South" />
                </div>
            </div>
        }
    }
}

export default connect(
    (state: ApplicationState) => state.deception, // Selects which state properties are merged into the component's props
    DeceptionStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Deception) as typeof Deception;