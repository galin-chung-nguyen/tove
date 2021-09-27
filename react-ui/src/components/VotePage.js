import { useEffect } from "react";
import { useCookies } from 'react-cookie';
import { useHistory, useParams } from "react-router-dom";
import Header from './Header';
import { FormGroup, Label } from 'reactstrap';
import { Container } from 'react-bootstrap';
import '../assets/css/VotePage.scss';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setVoteInfoAction, setSnackBarInfo, setSnackBarInfoAction } from "../redux/actions";
import ConfirmModal from './ConfirmModal';

import 'date-fns';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
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
import DashboardIcon from '@material-ui/icons/Dashboard';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import PeopleAltSharpIcon from '@material-ui/icons/PeopleAltSharp';
import Avatar from '@material-ui/core/Avatar';
import ThumbsUpDownSharpIcon from '@material-ui/icons/ThumbsUpDownSharp';
import Collapse from '@material-ui/core/Collapse';
import SendIcon from '@material-ui/icons/Send';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { KeyboardDateTimePicker } from "@material-ui/pickers";
import Skeleton from '@material-ui/lab/Skeleton';
import LinearProgress from '@material-ui/core/LinearProgress';
import MessageSnackBar from "./MessageSnackBar";

function changeTimeZone(curDate, newTZ) { // GMT-6 => +360
    return new Date(curDate.getTime() + (60000 * (curDate.getTimezoneOffset() - newTZ)));
}
function Overview(props) {
    const voteInfo = useSelector(state => state.voteInfo);
    const dispatch = useDispatch();

    console.log(voteInfo);
    const [dateTimeOpen, setDateTimeOpen] = useState(voteInfo.time_start ? voteInfo.time_start : new Date());
    const [dateTimeClosed, setDateTimeClosed] = useState(voteInfo.time_finish ? voteInfo.time_finish : new Date());

    const [timezone, setTimeZone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    useEffect(() => {
        let tz = timezone.offset ? timezone.offset * -60 : new Date().getTimezoneOffset();
        setDateTimeOpen(changeTimeZone(voteInfo.time_start ? voteInfo.time_start : new Date(), tz));
        setDateTimeClosed(changeTimeZone(voteInfo.time_finish ? voteInfo.time_finish : new Date(), tz));
    }, [timezone, voteInfo]);

    return (
        <div className={"Overview " + props.className}>
            <FormGroup controlid="heading" className='heading'>
                <Typography className="creater_info" color="textSecondary">
                    Created by : <span>{voteInfo.creater ? voteInfo.creater : "###"}</span>
                </Typography>
                <Typography className="vote_id" color="textSecondary">
                    Vote Id : <span>{voteInfo.vote_id ? voteInfo.vote_id : "###"}</span>
                </Typography>
                <Label className="vote_description">{voteInfo.description}</Label>
            </FormGroup>

            <TimezoneSelect
                value={timezone}
                onChange={(e) => setTimeZone(e)}
            />
            <div className='time_wrapper'>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Grid container justifyContent="space-around">
                        <KeyboardDateTimePicker
                            variant="inline"
                            ampm={false}
                            label="Time start"
                            value={dateTimeOpen}
                            onChange={() => { }}
                            onError={console.log}
                            format="MM/dd/yyyy HH:mm"
                        />
                        <KeyboardDateTimePicker
                            variant="inline"
                            ampm={false}
                            label="Time closed"
                            value={dateTimeClosed}
                            onChange={() => { }}
                            onError={console.log}
                            format="MM/dd/yyyy HH:mm"
                        />

                    </Grid>
                </MuiPickersUtilsProvider>
            </div>
        </div>
    )
}
function Participants(props) {
    const voteInfo = useSelector(state => state.voteInfo);
    const classes = makeStyles((theme) => ({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper,
        },
    }))();
    return (
        <div className={props.className}>
            <List dense className={classes.root + " list_participants"}>
                {voteInfo.list_participants && voteInfo.list_participants.map((value, index) => {
                    const labelId = `participants-list-secondary-label-${index}`;
                    return (
                        <ListItem key={index} button>
                            <ListItemAvatar>
                                <Avatar
                                    alt={`Avatar n°${value + 1}`}
                                    src={`/static/images/avatar/${value + 1}.jpg`}
                                />
                            </ListItemAvatar>
                            <ListItemText id={labelId} primary={value} />
                        </ListItem>
                    );
                })}
            </List>
        </div>
    );
}

function JoinVote(props) {
    const voteInfo = useSelector(state => state.voteInfo);
    const userInfo = useSelector(state => state.userInfo);
    const dispatch = useDispatch();
    const [checked, setChecked] = useState([]);
    const [open, setOpen] = useState([]);

    console.log(voteInfo)

    // initialized checked state of choices
    useEffect(() => {
        let tmp = [];
        if (voteInfo.choices) {
            for (let i = 0; i < voteInfo.choices.length; ++i) {
                if (voteInfo.voted == true && voteInfo.choices[i].includes(userInfo.googleId)) {
                    tmp.push(true);
                } else tmp.push(false);
            }
        }
        console.log(tmp);
        setChecked([...tmp]);
    }, [voteInfo]);

    // change checked state of each checkbox whenever clicked
    const handleToggle = (index) => {
        if (voteInfo.voted) return
        console.log('wtf')
        let tmp = checked;
        tmp[index] = !tmp[index];
        setChecked([...tmp]);
    };

    const classes = makeStyles((theme) => ({
        margin: {
            margin: theme.spacing(1),
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
    }))();

    // change shown/hidden state of each choice's detail
    const handleOpen = (index) => {
        console.log(index);
        let tmp = open;
        tmp[index] = !tmp[index];
        setOpen([...tmp]);
    };

    // each choice is initially open
    useEffect(() => {
        console.log('cool')
        let tmp = [];
        if (voteInfo.choices) {
            for (let i = 0; i < voteInfo.choices.length; ++i) {
                tmp.push(true);
            }
        }
        setOpen([...tmp]);
    }, [voteInfo]);

    // handle register/unregister clicks
    const handleRegisterVote = async () => {
        try {
            let requestType = voteInfo.joined ? "unregister" : "register";
            if (new Date().getTime() > new Date(voteInfo.time_finish).getTime()) {
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'This vote has ended!' }))
                return
            } else if (new Date().getTime() > new Date(voteInfo.time_start).getTime()) {
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'This vote has started! You cannot register/unregister this vote anymore!' }))
                return
            }
            setBtnClicked(0);
            setBtnClickLoading(true);
            let response = await fetch(`/api/v1/${requestType}-vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    voteId: voteInfo.vote_id
                })
            });

            let data = (await response.json()).data;
            console.log(data)
            switch (response.status) {
                case 201:
                    let tmp = voteInfo;
                    if (requestType == 'register') {
                        if (!tmp.list_participants.includes(data.userId)) tmp.list_participants.push(data.userId);
                    } else {
                        tmp.list_participants = tmp.list_participants.filter(x => x != data.userId);
                    }
                    tmp.joined = tmp.list_participants.includes(userInfo.googleId);

                    console.log('ok')
                    console.log(tmp);
                    dispatch(setSnackBarInfoAction({ open: true, type: "success", message: (requestType == 'register' ? 'Register' : 'Unregister') + ' vote successfully!' }))
                    dispatch(setVoteInfoAction({ ...tmp })); break;
                case 440:
                    dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'User haven\'t logged in yet!' }))
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
            setBtnClickLoading(false);
        } catch (err) {
            console.log(err)
        }
    }

    // handle vote
    const handleVote = async () => {
        if (new Date().getTime() > new Date(voteInfo.time_finish).getTime()) {
            dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'This vote has ended!' }))
            return
        }
        if (!voteInfo.joined) {
            dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'You haven\'t registered yet!' }))
            return
        } else {
            let t = new Date().getTime()
            if (t < voteInfo.time_start.getTime()) {
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'This vote hasn\'t started yet!' }));
                return
            } else if (t > voteInfo.time_finish.getTime()) {
                dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'This vote is over!' }));
                return
            }
        }

        try {
            let chosenChoices = []
            for (let i = 0; i < voteInfo.choices.length; ++i)
                if (checked[i]) chosenChoices.push(voteInfo.choices[i][0]);

            console.log("trying to vote for ", chosenChoices)

            let choiceTxt = (chosenChoices.length) + " " + (chosenChoices.length <= 1 ? "choice" : "choices");
            if (!(await window.confirmModal(`Confirm vote`, `Please confirm that you are voting for ${choiceTxt}! You can do this only once and cannot change your opinion later!`, 'Back', 'Vote'))) {
                console.log('reject')
                return
            }

            setBtnClicked(1);
            setBtnClickLoading(true);

            let response = await fetch(`/api/v1/vote-for`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    voteId: voteInfo.vote_id,
                    choices: chosenChoices
                })
            });

            let data = (await response.json()).data;
            console.log(data)
            switch (response.status) {
                case 201:
                    let tmp = voteInfo;
                    for (let i = 0; i < tmp.choices.length; ++i) {
                        let choiceId = tmp.choices[i][0];
                        if (data.listChoices.includes(choiceId) && !tmp.choices[i].includes(data.userId)) {
                            tmp.choices[i].push(data.userId);
                        }
                    }

                    tmp.voted = tmp.voted || data.userId == userInfo.googleId;
                    if (!tmp.list_participants_voted.includes(data.userId)) tmp.list_participants_voted.push(data.userId);
                    console.log(tmp);
                    dispatch(setSnackBarInfoAction({ open: true, type: "success", message: 'Vote successfully!' }))
                    dispatch(setVoteInfoAction({ ...tmp })); break;
                case 440:
                    dispatch(setSnackBarInfoAction({ open: true, type: "error", message: 'User haven\'t logged in yet!' }))
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
            setBtnClickLoading(false);
        } catch (err) {
            console.log(err)
        }
    }
    const [btnClickLoading, setBtnClickLoading] = useState(false);
    const [btnClicked, setBtnClicked] = useState(0);

    const registerBtnClass = "join_now_btn " + (btnClickLoading ? "" : (voteInfo.joined ? "" : "btn_theme "));
    const voteBtnClass = "vote_btn " + (voteInfo.voted ? "btn_voted_them" : (btnClickLoading ? ":" : (voteInfo.joined ? "btn_theme" : "")));

    console.log(voteBtnClass)
    console.log(voteInfo.voted);

    return (
        <div className={"join_vote_wrapper " + props.className}>
            <div className='join_vote_btn_group'>
                <div className='join_now_btn_wrapper'>
                    <ButtonMaterialUI variant="contained" size="medium" className={registerBtnClass} onClick={handleRegisterVote} disabled={btnClickLoading}>
                        {voteInfo.joined == true ? "Unregister" : "Register"}
                    </ButtonMaterialUI>
                    <CircularProgress size={24} className={'loading_cirlce ' + (!btnClickLoading || btnClicked == 1 ? "disabled" : "")} />
                </div>
                <div className="vote_btn_wrapper">
                    <ButtonMaterialUI className={voteBtnClass}
                        variant="contained" disabled={voteInfo.voted == true || (btnClickLoading || !voteInfo.joined)}
                        onClick={handleVote}
                    >
                        {voteInfo.voted == true ? "Voted" : "Send"}
                        <SendIcon className='send_icon' />
                    </ButtonMaterialUI>
                    {voteInfo.voted != true && <CircularProgress size={24} className={'loading_cirlce ' + (!btnClickLoading || btnClicked == 0 ? "disabled" : "")} />}
                </div>
            </div>
            <List className={classes.root}>
                {checked.map((value, index) => {
                    const labelId = `checkbox-list-label-${index}`;
                    const GreenCheckbox = withStyles({
                        root: {
                            '&$checked': {
                                color: green[600],
                            },
                        },
                        checked: {},
                    })((props) => <Checkbox color="default" {...props} />);

                    return (<>
                        <ListItem key={index} role={undefined} dense disableRipple button>
                            <ListItemIcon>
                                <GreenCheckbox
                                    edge="start"
                                    checked={value}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                    onClick={() => handleToggle(index)}
                                />
                            </ListItemIcon>

                            <div className='choice_name_wrapper' onClick={() => handleOpen(index)}>
                                <ListItemText id={labelId} primary={`${voteInfo.choices[index][1]}`} />
                                <IconButton>
                                    <MoreHorizIcon />
                                </IconButton>
                            </div>
                        </ListItem>
                        <Collapse in={open[index]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem key={"collapse_choice_" + index} button className={classes.nested}>
                                    <div className='choice_description_wrapper'>
                                        <Typography color="textSecondary">
                                            {voteInfo.choices[index][2]}
                                        </Typography>
                                        <ListItemIcon>
                                            <Badge color="secondary" badgeContent={voteInfo.choices[index].length - 3} max={10000} showZero>
                                                <HowToVoteIcon />
                                            </Badge>
                                        </ListItemIcon>
                                    </div>
                                </ListItem>
                            </List>
                        </Collapse>
                    </>
                    );
                })}
            </List>
        </div>
    )
}

function SkeletonLoading() {
    return (
        <>
            <Skeleton variant="rect" animation="wave" width={377} height={40} style={{ marginBottom: 38 }} />
            <Skeleton variant="rect" animation="wave" height={72} style={{ marginBottom: 15 }} />
            <Skeleton variant="rect" animation="wave" width={250} height={15} style={{ marginBottom: 10 }} />
            <Skeleton variant="rect" animation="wave" width={200} height={15} style={{ marginBottom: 15 }} />
            <Skeleton variant="rect" animation="wave" height={50} style={{ marginBottom: 15 }} />
            <Skeleton variant="rect" animation="wave" height={25} style={{ marginBottom: 15 }} />
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Skeleton variant="rect" animation="wave" width="47%" height={20} style={{ marginBottom: 15, marginRight: "6%" }} />
                <Skeleton variant="rect" animation="wave" width="47%" height={20} style={{ marginBottom: 15 }} />
            </div>
        </>
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

const VotePage = () => {
    let history = useHistory();
    const { voteId } = useParams();
    const voteInfo = useSelector(state => state.voteInfo);
    const dispatch = useDispatch();

    const [tabId, setTabId] = useState(0);

    const handleTabChange = (event, newId) => {
        setTabId(newId);
    };

    const [loadingVoteInfo, setLoadingVoteInfo] = useState(true);
    const [voteNotExist, setVoteNotExist] = useState(false);

    useEffect(async () => {
        let response = await fetch('/api/v1/get-vote-info', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                voteId: voteId
            })
        });

        switch (response.status) {
            case 200:
                let data = (await response.json()).data.voteInfo;
                data.time_start = new Date(Number(data.time_start));
                data.time_finish = new Date(data.time_start.getTime() + Number(data.vote_period));
                data.timezone = Number(data.timezone);
                dispatch(setVoteInfoAction(data));
                setLoadingVoteInfo(false);

                window.voteProgress = {
                    t1: new Date(data.time_start).getTime(),
                    t2: new Date(data.time_finish).getTime()
                }

                //
                updateProgressBar();
                setInterval(() => updateProgressBar(), 1000);

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

        setVoteProgress(Math.min(100,Math.trunc(Math.max(cur, t1) - t1) / (t2 - t1) * 100));

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
    console.log(voteInfo)

    return (
        <div className="bodyWrapper">
            <Header />
            <Container className='vote-info-wrapper'>
                <Paper elevation={3} className='vote-info-form'>
                    {/* Tab controller */}
                    {loadingVoteInfo ? <SkeletonLoading /> :
                        <>
                            <Typography className='vote_name' variant="h4" gutterBottom>
                                {voteInfo.vote_name}
                            </Typography>
                            <Typography className='vote_progress' gutterBottom>
                                <Label className='vote_progress_content'>{voteProgressContent}</Label>
                                <LinearProgress variant="determinate" value={voteProgress} />
                            </Typography>
                            <Paper square elevation={0}>
                                <Tabs
                                    value={tabId}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    onChange={handleTabChange}
                                    aria-label="disabled tabs example"
                                    centered
                                >
                                    <Tab icon={<DashboardIcon />} label="Overview" />
                                    <Tab icon={
                                        <Badge color="secondary" color="primary" badgeContent={voteInfo.list_participants ? voteInfo.list_participants.length : 0} max={1000} showZero>
                                            <PeopleAltSharpIcon />
                                        </Badge>
                                    } label="Participants" />
                                    <Tab icon={<ThumbsUpDownSharpIcon />} label="Join vote" />
                                </Tabs>
                            </Paper>
                            <Overview className={tabId != 0 ? "hidden" : ""} />
                            <Participants className={tabId != 1 ? "hidden" : ""} />
                            <JoinVote className={tabId != 2 ? "hidden" : ""} />
                        </>
                    }
                </Paper>
            </Container>
            <ConfirmModal />
            <MessageSnackBar />
        </div>
    );
}

export default VotePage;