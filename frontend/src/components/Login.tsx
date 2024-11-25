import '../App.css';
import { Box } from '@mui/system';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import Axios from './Axios';
import { useNavigate } from 'react-router-dom';
import MyMessage from './Message';
import { useState } from 'react';

interface IFormInput {
    email: string;
    password: string;
}

// Login component
const Login = () => {
    const { handleSubmit, control } = useForm<IFormInput>();
    const navigate = useNavigate();
    const [ShowMessage, setShowMessage] = useState(false);
    
    // Function to submit login form
    const submission: SubmitHandler<IFormInput> = (data) => {
        Axios.post(`login/`, {
            email: data.email,
            password: data.password
        }).then((response) => {
            console.log(response)
            localStorage.setItem('Token', response.data.token);
            navigate(`/home`);
        })
        .catch((error) => {
            setShowMessage(true);
            console.log("Error during login", error)
        });
    }
    return (
        <div className={"myBackground"}>
            {ShowMessage ? <MyMessage text={"Login Failed, Please Try Again"} color={"#EC5A76"}/> : null}
            <form onSubmit={handleSubmit(submission)}>

            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Login for Airgead Planner</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField 
                    label={"Email"}
                    name = {"email"}
                    control = {control} />
                </Box>
                <Box className={"itemBox"}>
                    <MyPassField 
                    label={"Password"}
                    name = {"password"}
                    control = {control} />
                </Box>
                <Box className={"itemBox"}>
                    <MyButton 
                    label={"Login"}
                    type={"submit"} />
                </Box>
                <Box className={"itemBox"} sx={{flexDirection:'column'}}>
                    <Link to="/register">Don't have an account? Register here</Link>
                    <Link to="/request/password_reset">Forgot your password? Reset here</Link>
                </Box>  
            </Box>
        </form>
        </div>
    );
}

export default Login;