import { combineReducers } from 'redux';
import { SET_USER_INFO, SET_VOTE_INFO, SET_SNACKBAR_INFO } from './const';

let setUserInfoReducer = (state = {},action) => {
    switch(action.type){
        case SET_USER_INFO : 
            return action.payload.newUserInfo;

        default : return state;
    }
}
let setVoteInfoReducer = (state = {}, action) => {
    switch(action.type){
        case SET_VOTE_INFO:
            return action.payload.newVoteInfo;

        default: return state;
    }
}
let setSnackBarInfoReducer = (state = {
    open : false,
    message : "",
    type : "success"
}, action) => {
    switch(action.type){
        case SET_SNACKBAR_INFO:
            console.log(state);
            return action.payload.newSnackbarInfo;

        default: return state;
    }
}
let rootReducer = combineReducers({
    userInfo : setUserInfoReducer,
    voteInfo : setVoteInfoReducer,
    snackBarInfo : setSnackBarInfoReducer
});

export default rootReducer;