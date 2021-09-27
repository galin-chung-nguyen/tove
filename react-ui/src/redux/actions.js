import { SET_USER_INFO, SET_VOTE_INFO, SET_SNACKBAR_INFO } from './const';

let setUserInfo = (newUserInfo = {}) => {
    return {
        type : SET_USER_INFO,
        payload : {
            newUserInfo : typeof(newUserInfo) == 'object' ? newUserInfo : null
        }
    }
}

let setVoteInfo = (newVoteInfo = {}) => {
    return {
        type : SET_VOTE_INFO,
        payload : {
            newVoteInfo : typeof(newVoteInfo) == 'object' ? newVoteInfo : null
        }
    }
}
let setSnackBarInfo = (newSnackBarInfo = {}) => {
    return {
        type : SET_SNACKBAR_INFO,
        payload : {
            newSnackbarInfo : typeof(newSnackBarInfo) == 'object' ? newSnackBarInfo : null
        }
    }
}

export let setUserInfoAction = setUserInfo;
export let setVoteInfoAction = setVoteInfo;
export let setSnackBarInfoAction = setSnackBarInfo;