import { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function ConfirmModal() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [backBtnContent, setBackBtnContent] = useState("");
    const [continueBtnContent, setContinueBtnContent] = useState("");
    const [resolveCallback, setResolveCallBack] = useState(() => () => { });

    window.confirmModal = async (tit, cnt, backCnt, continueCnt) => {
        setTitle(tit);
        setContent(cnt);
        setBackBtnContent(backCnt);
        setContinueBtnContent(continueCnt);

        return new Promise((resolve, reject) => {
            setResolveCallBack(() => (data) => resolve(data));
            setOpen(true);
        });
    }

    const handleClose = () => {
        setOpen(false);
        resolveCallback(false);
    }

    const handleContinue = async () => {
        setOpen(false);
        resolveCallback(true);
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                    {backBtnContent}
                    </Button>
                    <Button onClick={handleContinue} color="primary" autoFocus>
                        {continueBtnContent}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ConfirmModal;