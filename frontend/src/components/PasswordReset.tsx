import '../App.css';
import { Box } from '@mui/system';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import { useParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import Axios from './Axios';
import { useNavigate } from 'react-router-dom';
import MyMessage from './Message';
import { useState } from 'react';

interface IFormInput {
    email: string;
    password: string;
}

const PasswordReset = () => {
    const { handleSubmit, control } = useForm<IFormInput>();
    const navigate = useNavigate();
    const {token} = useParams();
    console.log(token);
    const [ShowMessage, setShowMessage] = useState(false);

    const submission: SubmitHandler<IFormInput> = (data) => {
        Axios.post(`password_reset/confirm/`, {
            password: data.password,
            token: token,

        }).then(() => {
            setShowMessage(true);
            setTimeout(() => {
                navigate(`/`);
            }, 6000);
        });
    }
    return(
        <div className={"myBackground"}>
            {ShowMessage ? <MyMessage text={"Your Password Reset Was Successfull"} color={"rgba(21,94,27,1)"}/> : null}
            <form onSubmit={handleSubmit(submission)}>

            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Request Password</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyPassField 
                    label={"Password"}
                    name = {"password"}
                    control = {control} />
                </Box>
                <Box className={"itemBox"}>
                    <MyPassField 
                    label={"Confirm password"}
                    name = {"password2"}
                    control = {control} />
                </Box>
                <Box className={"itemBox"}>
                    <MyButton 
                    label={"Reset Password"}
                    type={"submit"} />
                </Box>
                <Box className={"itemBox"} sx={{flexDirection:'column'}}>
    
                </Box>  
            </Box>
        </form>
        </div>
    )
}

export default PasswordReset;

