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

interface DeceptionState {lobby: string}

class Deception extends React.Component<DeceptionProps, DeceptionState> {

    constructor(props: DeceptionProps) {
        super(props);
        this.props.startListening();
    }

    public render() {
        return <div>
            {this.renderGame()}
        </div>;
    }
    
    private renderGame() {
        return <div>
            {this.renderDetails()}
        </div>
    }

    private renderDetails() {
        return <div>
            {this.props.lobby}
            {this.renderUndercover()}
                <div>We will ambush routes: {this.props.voteResult.map((result, i) => {
                return <div> {Direction[result]}</div>;
                })}
            </div>
            {this.renderAmbushSuccess()}
            {this.renderHint()}
            {this.renderVoteButtons()}
            {this.renderResult()}
            </div>
    }

    private renderHint() {
        if (!!this.props.hint) {
            return <div> {this.props.hint}</div>;
        }
    }

    private renderResult() {
        if (this.props.gameOver) {
            return <div> Captains won: {this.props.gameResult} </div>;
        }
    }

    private renderAmbushSuccess() {
        if (this.props.ambushWasSuccess) {
            return <div>Nice, we got those damn orcs</div>;
        }
        return <div> They got past! </div>
    }

    private renderUndercover() {
        if (this.props.isUndercover) {
            return <div> YOU ARE AN ENEMY OF THE STATE. Keep quiet! </div>
        }
        return <div> You are a loyal captain of the guard </div>
    }

    private renderVoteButtons() {
        if (!this.props.hasVotedThisRound) {
            return <div>
                <input type="button" id="voteNorth" onClick={() => { this.props.vote(this.props.lobby, DeceptionStore.Direction.North) }} value="North" />
                <input type="button" id="voteEast" onClick={() => { this.props.vote(this.props.lobby, DeceptionStore.Direction.East) }} value="East" />
                <input type="button" id="voteSouth" onClick={() => { this.props.vote(this.props.lobby, DeceptionStore.Direction.South) }} value="South" />
                <input type="button" id="voteWest" onClick={() => { this.props.vote(this.props.lobby, DeceptionStore.Direction.West) }} value="West" />
            </div>
        }
    }
    
}

export default connect(
    (state: ApplicationState) => state.deception, // Selects which state properties are merged into the component's props
    DeceptionStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Deception) as typeof Deception;