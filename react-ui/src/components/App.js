import '../assets/css/App.css';
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Login from "./Login";
import Logout from "./Logout";
import CreateNewVote from './CreateNewVote';
import VotePage from './VotePage';
import Profile from './Profile';
import Home from './Home';
import { useCookies } from 'react-cookie';
import { setUserInfoAction } from '../redux/actions';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';

function App() {
  let state = useSelector(state => state.userInfo);
  let dispatch = useDispatch();

  const [checkLogin, setCheckLogin] = useState(false);
  let history = useHistory();

  useEffect(async () => {
    try {
      let response = await fetch('/api/v1/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let data = await response.json();
      switch (response.status) {
        case 200: dispatch(setUserInfoAction(data)); break;
        default: break;
      }
    } catch (err) {
      console.log(err)
    }

    setCheckLogin(true)
  }, []);

  useEffect(() => {
    if (checkLogin) {
      if (state && typeof (state.name) == 'string') {
        let tmp = history.location.pathname.substr(0, 8);
        if (tmp == '/sign-in') {
          history.push('/')
        }
      } else {
        let tmp = history.location.pathname.substr(0,16);
        if (tmp == '/create-new-vote') history.push('/');
      }
    }
  }, [checkLogin, state]);

  console.log(state);

  return (
    <Switch>
      {
        checkLogin && <> <Route exact path='/' component={Home} />
          <Route exact path="/sign-in" component={Login} />
          <Route exact path='/logout' component={Logout} />
          <Route exact path='/create-new-vote' component={CreateNewVote} />
          <Route exact path='/vote/:voteId' component = {VotePage} /> 
          <Route exact path='/profile' component = {Profile} /> 
        </>
      }
    </Switch>
  );
}

export default App;