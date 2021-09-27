import { useEffect } from "react";
import { useCookies } from 'react-cookie';
import { useHistory, useParams } from "react-router-dom";
import Header from './Header';
import Button from '@material-ui/core/Button';
import { Form, FormGroup, Label } from 'reactstrap';
import { Container } from 'react-bootstrap';
import '../assets/css/Profile.scss';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVoteInfoAction, setSnackBarInfo, setSnackBarInfoAction } from "../redux/actions";
import TextareaAutosize from 'react-textarea-autosize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentLoader from "react-content-loader"
import Link from '@material-ui/core/Link';

import ConfirmModal from './ConfirmModal';

import 'date-fns';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';

import TimezoneSelect from 'react-timezone-select'

import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

// Join vote
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import ButtonMaterialUI from '@material-ui/core/Button';
import { Typography } from "@material-ui/core";
import Badge from '@material-ui/core/Badge';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Collapse from '@material-ui/core/Collapse';
import SendIcon from '@material-ui/icons/Send';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import Skeleton from '@material-ui/lab/Skeleton';
import LinearProgress from '@material-ui/core/LinearProgress';
import MessageSnackBar from "./MessageSnackBar";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

function changeTimeZone(curDate, newTZ) { // GMT-6 => +360
    return new Date(curDate.getTime() + (60000 * (curDate.getTimezoneOffset() - newTZ)));
}
function SkeletonLoading() {
    return (
        <Container className='skeleton_profile'>
            <div className='skeleton_avatar'>
                <Skeleton variant="circle" animation="wave" width={132} height={132} style={{ marginBottom: 15 }} />
                <Skeleton variant="rect" animation="wave" width={200} height={25} style={{ marginBottom: 15 }} />
            </div>
            <div className='skeleton_list_created'>
                <Skeleton variant="rect" animation="wave" width={300} height={25} style={{ marginBottom: 15 }} />
                <Grid className='vote_list_container' container spacing={2}>
                    {[1, 2, 3, 4, 5].map((voteData, index) =>
                        <Grid item xs={12} md={6} lg={4}>
                            <Skeleton variant="rect" animation="wave" height={250} style={{ marginBottom: 5 }} />
                            <Skeleton variant="rect" animation="wave" width = "37%" height={15} />
                        </Grid>
                    )}
                </Grid>
            </div>
        </Container>
    )
}

function getShortTime(ms) {
    let s = ms / 1000;
    let min = s / 60;
    let h = min / 60;
    let d = h / 24;
    let m = d / 30;
    let y = m / 365

    if (y >= 1) {
        y = Math.trunc(y);
        return y + " year" + (y == 1 ? "" : "s");
    }
    if (m >= 1) {
        m = Math.trunc(m);
        return m + " month" + (m == 1 ? "" : "s");
    }
    if (d >= 1) {
        d = Math.trunc(d);
        return d + "d";
    }
    if (h >= 1) {
        h = Math.trunc(h);
        return h + "h";
    }
    if (min >= 1) {
        min = Math.trunc(min);
        return min + "m";
    }
    s = Math.trunc(s);
    return s + "s";
}

function VoteCardItems(props) {
    console.log(props);
    return (
        <Card>
            <CardActionArea>
                <CardMedia
                    component="img"
                    alt={props.vote_name}
                    height="200"
                    image={'/vote.jpg'}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {props.vote_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {props.description}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary">
                    Copy link
                </Button>
                <Link href={`/vote/${props.vote_id}`}>
                    <Button size="small" color="primary">

                        Details
                    </Button>
                </Link>
            </CardActions>
        </Card>
    )
}

const VotePage = () => {
    let history = useHistory();
    const { voteId } = useParams();
    const voteInfo = useSelector(state => state.voteInfo);
    const userInfo = useSelector(state => state.userInfo);
    const dispatch = useDispatch();
    const [listVotesCreated, setListVotesCreated] = useState([]);
    const [listVotesJoined, setListVotesJoined] = useState([]);

    const [tabId, setTabId] = useState(0);

    const handleTabChange = (event, newId) => {
        setTabId(newId);
    };

    const [loadingUserData, setLoadingUserData] = useState(true);

    useEffect(async () => {
        let response = await fetch('/api/v1/get-user-data', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                userId: userInfo.googleId
            })
        });

        switch (response.status) {
            case 200:
                let data = (await response.json()).data.userData;/*{
                    "userId": "106096926437813157426",
                    "list_votes_created": [
                        {
                            "vote_id": "vote-1",
                            "creater": "106096926437813157426",
                            "vote_name": "Material Design",
                            "status": 0,
                            "description": "Build beautiful products, faster.",
                            "time_start": "1629357240000",
                            "vote_period": "120000",
                            "count_participants": "1",
                            "list_participants": [],
                            "list_participants_voted": [],
                            "choices": [],
                            "timezone": "420"
                        }
                    ],
                    "list_votes_joined": [
                        {
                            "vote_id": "vote-1",
                            "creater": "106096926437813157426",
                            "vote_name": "Material Design",
                            "status": 0,
                            "description": "Build beautiful products, faster.",
                            "time_start": "1629357240000",
                            "vote_period": "120000",
                            "count_participants": "1",
                            "list_participants": [],
                            "list_participants_voted": [],
                            "choices": [],
                            "timezone": "420"
                        }
                    ]
                }*/
                //

                setListVotesCreated(data.list_votes_created);
                setListVotesJoined(data.list_votes_joined);

                console.log(data);

                setLoadingUserData(false);
                break;
            case 440:
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'Please sign in first!' }))
                break;
            case 400:
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'Data requested is not valid!' }))
                break;
            case 500:
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'Sorry! There was an internal server error!' }))
                break;
            default:
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'Sorry! There was an unexpected error!' }))
                break;
        }

        console.log('cool');
    }, []);

    // vote progress bar
    const [voteProgressLabel, setVoteProgressLabel] = useState("open");
    const [voteProgressContent, setVoteProgressContent] = useState("#");
    const [voteProgress, setVoteProgress] = useState(0);
    /*const [choiceSorted,setChoiceSorted] = useState(false);

    useEffect(()=>{
        if(voteProgressLabel == 'ended' && !choiceSorted && voteInfo.choices){
            let tmp = voteInfo;
            tmp.choices.sort((a,b) => b.length - a.length);
            console.log(tmp.choices);
            setChoiceSorted(true);
            dispatch(setVoteInfoAction(tmp));
        }
    },[voteInfo, voteProgressLabel]);*/

    const updateProgressBar = () => {
        // update vote progress bar
        let cur = new Date().getTime();
        let t1 = window.voteProgress.t1,
            t2 = window.voteProgress.t2

        setVoteProgress(Math.min(100, Math.trunc(Math.max(cur, t1) - t1) / (t2 - t1) * 100));

        let pclass = "opening", pcontent = "Opening";

        if (cur < t1) {
            setVoteProgressContent("Starts in " + getShortTime(t1 - cur));
        } else if (cur < t2) {
            //setVoteProgressLabel("running");
            setVoteProgressContent(getShortTime(t2 - cur) + " till finish");
        } else {
            //setVoteProgressLabel("ended");
            setVoteProgressContent("Ended");
        }
    }

    console.log(userInfo)

    return (
        <div className="profile_page_bodyWrapper">
            <Header />
            {loadingUserData ? <SkeletonLoading /> :
                <div className='content_wrapper'>
                    <Paper className='profile_wrapper'>
                        <div className='img_cover'>
                            <div className='avatar_wrapper'>
                                <div className='avatar'>
                                    <img src={userInfo.imageUrl} />
                                </div>
                                <div className="user_name">
                                    {userInfo.name}
                                </div>
                            </div>
                        </div>

                    </Paper>
                    <Container className='main_list_wrapper'>
                        <div className='created_votes_list'>
                            <p className='heading'>
                                List of votes you created
                            </p>
                            {listVotesCreated.length <= 0 ? "You haven't created any vote yet!" :
                                <Grid className='vote_list_container' container spacing={2}>
                                    {listVotesCreated.map((voteData, index) =>
                                        <Grid item xs={12} md={6} lg={4}>
                                            <VoteCardItems {...voteData} />
                                        </Grid>
                                    )}
                                </Grid>
                            }
                        </div>

                        <div className='joined_votes_list'>
                            <p className='heading'>
                                List of votes you joined
                            </p>

                            {listVotesJoined.length <= 0 ? "You haven't joined any vote yet!" :
                                <Grid className='vote_list_container' container spacing={2}>
                                    {listVotesJoined.map((voteData, index) =>
                                        <Grid item xs={12} md={6} lg={4}>
                                            <VoteCardItems {...voteData} />
                                        </Grid>
                                    )}
                                </Grid>
                            }
                        </div>

                    </Container>
                </div>
            }

            <ConfirmModal />
            <MessageSnackBar />
        </div>
    );
}

export default VotePage;