﻿import { Action, Reducer, ActionCreator } from 'redux';
import { push } from 'react-router-redux';
import { AppThunkAction } from '.';
import { fetch, addTask } from 'domain-task';
import { connection } from '../configureStore';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface LobbyState {
    lobby: string;
    hasJoinedLobby: boolean;
    hasGameStarted: boolean;
    messages: string[];
}

const unloadedState: LobbyState = {
    lobby: '',
    hasJoinedLobby: false,
    hasGameStarted: false,
    messages: []
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface JoinLobbyRequestAction { type: 'JOIN_LOBBY_REQUEST' };
interface JoinLobbyAction { type: 'JOIN_LOBBY'; lobby: string };
interface GameStartedAction { type: 'GAME_STARTED' };
interface LeaveLobbyAction { type: 'LEAVE_LOBBY'; lobby: string };
interface CreateLobbyRequestAction { type: 'CREATE_LOBBY_REQUEST' };
interface SendMessageAction { type: 'SEND_MESSAGE'; message: string };
interface ReceiveMessageAction { type: 'RECEIVE_MESSAGE'; message: string };
interface FailedJoinLobbyAction { type: 'FAILED_JOIN_LOBBY'; lobby: string };

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = JoinLobbyRequestAction | JoinLobbyAction |
    CreateLobbyRequestAction | LeaveLobbyAction |
    SendMessageAction | ReceiveMessageAction |
    FailedJoinLobbyAction | GameStartedAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    startListening: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.on('ReceiveMessage', data => {
            dispatch({ type: 'RECEIVE_MESSAGE', message: data });
        });
        connection.on('FailedJoinLobby', data => {
            dispatch({ type: 'FAILED_JOIN_LOBBY', lobby: data });
        });
        connection.on('JoinedLobby', data => {
            dispatch({ type: 'JOIN_LOBBY', lobby: data });
        });
        connection.on('GameStarted', data => {
            dispatch({ type: 'GAME_STARTED' });
        });
    },
    startGame: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('StartGame', lobby);
    },
    joinLobbyRequest: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (lobby !== getState().lobby.lobby) {
            connection.invoke('JoinLobby', lobby);
            dispatch({ type: 'JOIN_LOBBY', lobby });
        }
    },
    createLobbyRequest: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('CreateLobby');
    },
    leaveLobbyRequest: (lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('LeaveLobby', lobby);
        dispatch({ type: 'LEAVE_LOBBY', lobby });
    },
    sendMessage: (message: string, lobby: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        connection.invoke('SendMessage', message, lobby);
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<LobbyState> = (state: LobbyState, action: KnownAction) => {
    switch (action.type) {
        case 'JOIN_LOBBY':
            return {
                lobby: action.lobby,
                hasJoinedLobby: true,
                hasGameStarted: false,
                messages: []
            };
        case 'CREATE_LOBBY_REQUEST':
            return state;
        case 'JOIN_LOBBY_REQUEST':
            return state;
        case 'LEAVE_LOBBY':
            if (action.lobby == state.lobby) {
                return unloadedState;
            }
            return state;
        case 'RECEIVE_MESSAGE':
            return {
                ...state,
                messages: state.messages.concat(action.message)
            }
        case 'SEND_MESSAGE':
            return state;
        case 'FAILED_JOIN_LOBBY':
            if (action.lobby != state.lobby) {
                return state;
            }
            return {
                ...state,
                hasJoinedLobby: false,
                lobby: ''
                //This should return an error message
            }
        case 'GAME_STARTED':
            return {
                ...state,
                hasGameStarted: true
            }
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    // For unrecognized actions (or in cases where actions have no effect), must return the existing state
    //  (or default initial state if none was supplied)
    return state || unloadedState;
};