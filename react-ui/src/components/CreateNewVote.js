import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Header from './Header';
import { Form, FormGroup, Label, Input, FormFeedback, Toast, ToastHeader, ToastBody } from 'reactstrap';
import { Container } from 'react-bootstrap';
import '../assets/css/CreateNewVote.scss';
import { Alert } from 'react-bootstrap';
import { useState } from 'react';
import { useDispatch } from "react-redux";
import TextareaAutosize from 'react-textarea-autosize';
import ContentLoader from "react-content-loader"
import { setSnackBarInfoAction } from '../redux/actions';
import MessageSnackBar from './MessageSnackBar';
import ConfirmModal from './ConfirmModal';

import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';

import TimezoneSelect from 'react-timezone-select'

function MaterialUIPickers(props) {
    // The first commit of Material-UI
    const [voteTime, setVoteTime] = useState([props.initDate, props.initDate, props.initDate, props.initDate]);

    useEffect(() => {
        props.setVoteTime(voteTime);
    }, [voteTime]);

    const handleDateChange = (date, index) => {
        if (props.stage != 'creating') {
            let tmp = voteTime;
            tmp[index] = date;
            setVoteTime([...tmp]);
        }
    };

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container justifyContent="space-around">
                <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MM/dd/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Date open"
                    value={voteTime[0]}
                    onChange={(date) => handleDateChange(date, 0)}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
                <KeyboardTimePicker
                    margin="normal"
                    id="time-picker"
                    label="Time open"
                    value={voteTime[1]}
                    onChange={(date) => handleDateChange(date, 1)}
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                    }}
                />
                <KeyboardDatePicker
                    margin="normal"
                    id="date-picker-dialog"
                    label="Date closed"
                    format="MM/dd/yyyy"
                    value={voteTime[2]}
                    onChange={(date) => handleDateChange(date, 2)}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
                <KeyboardTimePicker
                    margin="normal"
                    id="time-picker"
                    label="Time closed"
                    value={voteTime[3]}
                    onChange={(date) => handleDateChange(date, 3)}
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                    }}
                />
            </Grid>
        </MuiPickersUtilsProvider>
    );
}

const AddNewChoiceBox = (props) => {
    const [ok, setOK] = useState(false);
    const [choiceName, setChoiceName] = useState("");
    const [choiceDescription, setChoiceDescription] = useState("");

    useEffect(() => {
        setOK(choiceName.length > 0 && choiceDescription.length > 0);
    }, [choiceName, choiceDescription]);

    const handleNameChange = (e) => {
        setChoiceName(e.target.value);
    }
    const handleDescriptionChange = (e) => {
        setChoiceDescription(e.target.value);
    }
    const handleFinish = (isAdding) => {
        if (!ok) props.onCancel();
        else props.onSuccess(choiceName, choiceDescription);
        setChoiceName("");
        setChoiceDescription("");
    }

    return (
        <>
            <div className='add-new-choice-wrapper'>
                <div className='add-new-choice-box'>
                    <TextareaAutosize maxLength={100} className='choice-name-input' placeholder="Enter new choice name" value={choiceName} onChange={handleNameChange} />
                    <TextareaAutosize maxLength={500} className='choice-description-input' placeholder="Description" value={choiceDescription} onChange={handleDescriptionChange} />
                </div>
                <div className='add-choice-btn-wrapper'>
                    <div className={'btnOk-wrapper' + (ok ? '' : ' disabled')}>
                        <button type="button" onClick={() => handleFinish(true)}>Add choice</button>
                    </div>
                    <div className='btnCancel-wrapper'>
                        <button type="button" onClick={() => handleFinish(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        </>
    )
}

const CreateNewVote = () => {
    let history = useHistory();

    const dispatch = useDispatch();

    const [isAddingNewChoice, setAddingNewChoice] = useState(false);
    const [voteName, setVoteName] = useState("");
    const [voteDescription, setVoteDescription] = useState("");

    const [timezone, setTimeZone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const [voteTime, setVoteTime] = useState([]);

    const [listChoices, setListChoices] = useState([]);
    const [stage, setStage] = useState("edit");
    const [error, setError] = useState("");

    const handleVoteNameChange = (e) => {
        setVoteName(e.target.value);
    }
    const handleVoteDescriptionChange = (e) => {
        setVoteDescription(e.target.value);
    }
    const handleAddNewChoiceSuccess = (choiceName, choiceDescription) => {
        console.log(choiceName);
        console.log(choiceDescription);
        setListChoices([...listChoices, { name: choiceName, description: choiceDescription }]);
        setAddingNewChoice(false);
    }
    const handleAddNewChoiceCancel = () => {
        setAddingNewChoice(false);
    }
    const removeChoice = (index) => {
        setListChoices([...listChoices.slice(0, index), ...listChoices.slice(index + 1)]);
    }
    const handleCreateNewVote = (e) => {
        let newErr = ""
        if (voteName.length <= 0) newErr = "Vote name cannot be empty!";
        else if (voteDescription.length <= 0) newErr = "Vote description cannot be empty!";
        else if (listChoices.length < 2) newErr = "There must be at least two choices!"
        else {
            let d0 = voteTime[0], d1 = voteTime[1],
                d2 = voteTime[2], d3 = voteTime[3];

            let timeStart = new Date(`${d0.getFullYear()}-${_(d0.getMonth() + 1)}-${_(d0.getDate())}T${_(d1.getHours())}:${_(d1.getMinutes())}:00.000${_tz()}`);
            let timeFinish = new Date(`${d2.getFullYear()}-${_(d2.getMonth() + 1)}-${_(d2.getDate())}T${_(d3.getHours())}:${_(d3.getMinutes())}:00.000${_tz()}`);

            if (new Date().getTime() + 60 * 1000 > timeStart.getTime())
                newErr = "Vote cannot be started too soon!";
            else if (timeStart.getTime() + 60 * 1000 > timeFinish.getTime())
                newErr = "Vote cannot finish too soon!";
        }

        if (newErr != "") {
            setError(newErr);
        } else {
            setError("");
            handleConfirmCreate();
        }
        e.preventDefault()
    }
    const handleConfirmClose = () => {
        setStage("edit");
    }
    const _ = (txt) => {
        return ("000" + txt.toString()).substr(-2);
    }
    const _tz = () => {
        let tz = Number(timezone.offset ? timezone.offset : -new Date().getTimezoneOffset() / 60);
        let tzStr = "00";
        if (Math.round(tz) != tz) tzStr = "30";
        tzStr = _(Math.abs(Math.round(tz))) + ":" + tzStr;
        tzStr = (tz < 0 ? "-" : "+") + tzStr;
        return tzStr;
    }
    const handleConfirmCreate = async () => {

        if (!(await window.confirmModal(`Confirm creating new vote`, `Make sure that you checked all information of the vote carefully! Once you've created new vote, all information of the vote (vote name, description, choices, ...) cannot be changed anymore.`, 'Back', 'Create'))) {
            console.log('reject')
            return
        }

        setStage("creating");

        let d0 = voteTime[0], d1 = voteTime[1],
            d2 = voteTime[2], d3 = voteTime[3];

        let timeStart = new Date(`${d0.getFullYear()}-${_(d0.getMonth() + 1)}-${_(d0.getDate())}T${_(d1.getHours())}:${_(d1.getMinutes())}:00.000${_tz()}`);
        let timeFinish = new Date(`${d2.getFullYear()}-${_(d2.getMonth() + 1)}-${_(d2.getDate())}T${_(d3.getHours())}:${_(d3.getMinutes())}:00.000${_tz()}`);

        let response = await fetch('/api/v1/create-new-vote', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                voteName: voteName,
                voteDescription: voteDescription,
                timeStart : timeStart,
                timeFinish : timeFinish,
                timeZone : Number(timezone.offset ? timezone.offset : -new Date().getTimezoneOffset() / 60),
                listChoices: listChoices
            })
        });

        switch (response.status) {
            case 201: 
                let data = (await response.json()).data;
                dispatch(setSnackBarInfoAction({ open: true, type: "success", message: 'Create new vote successfully!' }))
                history.push('/vote/' + data.voteId);
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
        setStage("edit");
    }

    return (
        <>
            <Header />
            <Container className='create-new-vote-wrapper'>
                <Form className='create-new-vote-form'>
                    <FormGroup controlid="heading" className='heading'>
                        <Label><h2>{stage == 'creating' ? 'Creating new vote ...' : 'Create your new vote'}</h2></Label>
                    </FormGroup>
                    <FormGroup controlid="vote-info-input" className='vote-info-input'>
                        <TextareaAutosize placeholder='Vote name' value={voteName} onChange={handleVoteNameChange} readOnly={stage == 'creating'} maxLength={300} />
                        <TextareaAutosize placeholder='Vote description' value={voteDescription} onChange={handleVoteDescriptionChange} readOnly={stage == 'creating'} maxLength={1000} />
                    </FormGroup>
                    <FormGroup controlid="time-select" className="time-select-box">
                        <TimezoneSelect
                            value={timezone}
                            onChange={(e) => { if (stage != 'creating') setTimeZone(e) }}
                        />
                        <MaterialUIPickers stage={stage} initDate={new Date()} setVoteTime={setVoteTime} />
                    </FormGroup>
                    <div className='listChoices'>
                        {listChoices.map((choice, index) =>
                            <div key={"hello" + index} eventkey={index} className="toast_wrapper my-3 rounded">
                                <Toast className='choice_toast'>
                                    <ToastHeader>
                                        {choice.name}
                                    </ToastHeader>
                                    <ToastBody>
                                        {choice.description}
                                    </ToastBody>
                                </Toast>
                                <div className="select_choice_box" onClick={() => removeChoice(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                        {stage != 'creating' &&
                                            <g fill="none" fillRule="evenodd"><path d="M0 0h24v24H0z"></path><rect width="14" height="1" x="5" y="6" fill="currentColor" rx=".5"></rect><path fill="currentColor" d="M10 9h1v8h-1V9zm3 0h1v8h-1V9z"></path><path stroke="currentColor" d="M17.5 6.5h-11V18A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5zm-9 0h7V5A1.5 1.5 0 0 0 14 3.5h-4A1.5 1.5 0 0 0 8.5 5v1.5z"></path></g>
                                        }
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                    {stage != 'creating' &&
                        <>{isAddingNewChoice ? <> <AddNewChoiceBox onSuccess={handleAddNewChoiceSuccess} onCancel={handleAddNewChoiceCancel} />
                        </> : <button type="button" className="add_choice_button" onClick={() => setAddingNewChoice(true)}><span className="icon_add" aria-hidden="true"><svg width="13" height="13"><path d="M6 6V.5a.5.5 0 0 1 1 0V6h5.5a.5.5 0 1 1 0 1H7v5.5a.5.5 0 1 1-1 0V7H.5a.5.5 0 0 1 0-1H6z" fill="currentColor" fillRule="evenodd"></path></svg></span>Add choice</button>
                        }</>
                    }
                    <div className='error_box'>
                        <Alert variant="danger" className="error_text" show={error != ""}>
                            <p>{error}</p>
                        </Alert>
                    </div>
                    <div className='go_btn_wrapper'>
                        {stage == 'creating' ?
                            <ContentLoader
                                width={500}
                                height={45}
                                viewBox="0 0 500 45"
                                style={{ width: '100%' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect rx="3" ry="3" width="100%" height="9" />
                                <rect rx="3" ry="3" width="80%" height="9" y="18" />
                                <rect rx="3" ry="3" width="60%" height="9" y="36" />
                            </ContentLoader>
                            : <button onClick={handleCreateNewVote}>Go</button>}
                    </div>
                </Form>
            </Container>
            <MessageSnackBar />
            <ConfirmModal />
        </>
    );
}

export default CreateNewVote;