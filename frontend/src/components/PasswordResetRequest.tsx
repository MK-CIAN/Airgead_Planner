import '../App.css';
import { Box } from '@mui/system';
import MyTextField from './forms/MyTextField';
import MyButton from './forms/MyButton';
import { useForm, SubmitHandler } from 'react-hook-form';
import Axios from './Axios';
import { useNavigate } from 'react-router-dom';
import MyMessage from './Message';
import { useState } from 'react';

interface IFormInput {
    email: string;
    password: string;
}

const PasswordResetRequest = () => {
    const { handleSubmit, control } = useForm<IFormInput>();
    const navigate = useNavigate();

    const [ShowMessage, setShowMessage] = useState(false);

    const submission: SubmitHandler<IFormInput> = (data) => {
        Axios.post(`api/password_reset/`, {
            email: data.email,
        }).then((response) => {
            setShowMessage(true);
        });
    }
    return(
        <div className={"myBackground"}>
            {ShowMessage ? <MyMessage text={"Password Reset Request Sent"} /> : null}
            <form onSubmit={handleSubmit(submission)}>

            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Request Password Reset</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField 
                    label={"Email"}
                    name = {"email"}
                    control = {control} />
                </Box>
                <Box className={"itemBox"}>
                    <MyButton 
                    label={"Request Password Reset"}
                    type={"submit"} />
                </Box>
                <Box className={"itemBox"} sx={{flexDirection:'column'}}>
    
                </Box>  
            </Box>
        </form>
        </div>
    )
}

export default PasswordResetRequest;

