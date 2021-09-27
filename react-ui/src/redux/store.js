import { applyMiddleware, createStore } from "redux";
import rootReducer from './reducers.js';

let configureStore = (defaultState = {
    userInfo: {},
    voteInfo: {},
    snackBarInfo: {}
}) => {
    return createStore(rootReducer, defaultState);
}

export default configureStore;