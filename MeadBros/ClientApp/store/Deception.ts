import { Action, Reducer, ActionCreator} from 'redux';
import { AppThunkAction } from '.';
import { connection } from '../configureStore';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.
export enum Direction {
    North = 1,
    East,
    South,
    West
}

export interface DeceptionState {
    lobby: string,
    isUndercover: boolean,
    voteResult: Direction[],
    ambushWasSuccess: boolean,
    hasVotedThisRound: boolean,
    hint: string,
    gameResult: boolean,
    gameOver: boolean
}

const unloadedState: DeceptionState = {
    lobby: '',
    isUndercover: false,
    voteResult: [],
    ambushWasSuccess: false,
    hasVotedThisRound: false,
    hint: '',
    gameResult: false,
    gameOver: false
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface InitialiseAction { type: 'INITIALISE', lobby: string };
interface VoteAction { type: 'VOTE' };
interface ReceiveVoteResults { type: 'RECEIVE_VOTE_RESULTS'; votes: Direction[] };
interface ReceiveAmbushResults { type: 'RECEIVE_AMBUSH_RESULTS'; ambushSucceeded: boolean };
interface ReceivePlayerRole { type: 'RECEIVE_PLAYER_ROLE'; isUndercover: boolean };
interface ReceiveHint{ type: 'RECEIVE_HINT'; hint: string };
interface ReceiveGameResult { type: 'GAME_COMPLETE'; result: boolean };

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = InitialiseAction | VoteAction | ReceiveVoteResults | ReceiveAmbushResults | ReceivePlayerRole | ReceiveHint | ReceiveGameResult;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    startListening: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.on('ReceiveDetails', data => {
            dispatch({ type: 'RECEIVE_PLAYER_ROLE', isUndercover: data });
        });
        connection.on('VoteResults', data => {
            dispatch({ type: 'RECEIVE_VOTE_RESULTS', votes: data });
        });
        connection.on('AmbushResult', data => {
            dispatch({ type: 'RECEIVE_AMBUSH_RESULTS', ambushSucceeded: data });
        });
        connection.on('ReceiveHint', data => {
            dispatch({ type: 'RECEIVE_HINT', hint: data });
        });
        connection.on('GameComplete', data => {
            dispatch({ type: 'GAME_COMPLETE', result: data });
        });
        dispatch({ type: 'INITIALISE', lobby: getState().lobby.lobby });
        connection.invoke('SendPlayerDetails', getState().lobby.lobby);
    },
    vote: (lobby: string, direction: Direction): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('ReceiveVote', lobby, direction);
        dispatch({ type: 'VOTE' });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<DeceptionState> = (state: DeceptionState, action: KnownAction) => {
    switch (action.type) {
        case 'RECEIVE_PLAYER_ROLE':
            return {
                ...state,
                isUndercover: action.isUndercover,
                gameOver: false
            };
        case 'RECEIVE_AMBUSH_RESULTS':
            return {
                ...state,
                ambushWasSuccess: action.ambushSucceeded,
                hasVotedThisRound: false
            };
        case 'RECEIVE_VOTE_RESULTS':
            console.log(action.votes);
            return {
                ...state,
                voteResult: action.votes
            };
        case 'VOTE':
            return {
                ...state,
                hasVotedThisRound: true
            };
        case 'INITIALISE':
            return {
                ...state,
                lobby: action.lobby
            }
        case 'GAME_COMPLETE':
            return {
                ...state,
                gameResult: action.result,
                gameOver: true
            }
        case 'RECEIVE_HINT':
            return {
                ...state,
                hint: action.hint
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || unloadedState;
};
