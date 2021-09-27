import Snackbar from '@material-ui/core/Snackbar';
import { useDispatch, useSelector } from 'react-redux';
import { setSnackBarInfoAction } from '../redux/actions';
import Alert from '@material-ui/lab/Alert';

export default function MessageSnackBar() {
    // snackBar
    const snackBarInfo = useSelector(state => state.snackBarInfo);
    const dispatch = useDispatch();

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        dispatch(setSnackBarInfoAction({ ...snackBarInfo, open: false }));
    };

    return (
        <Snackbar open={snackBarInfo.open}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            autoHideDuration={6000} onClose={handleCloseSnackBar}>
            <Alert onClose={handleCloseSnackBar} severity={snackBarInfo.type}>{snackBarInfo.message}</Alert>
        </Snackbar>
    )
}