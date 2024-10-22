import '../App.css';
import { Box } from '@mui/system';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';
import MyButton from './forms/MyButton';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import Axios from './Axios';
import { useNavigate } from 'react-router-dom';

interface IFormInput {
    email: string;
    password: string;
}

const Login = () => {
    const { handleSubmit, control } = useForm<IFormInput>();
    const navigate = useNavigate();

    const submission: SubmitHandler<IFormInput> = (data) => {
        Axios.post(`login/`, {
            email: data.email,
            password: data.password
        }).then((response) => {
            console.log(response)
            localStorage.setItem('token', response.data.token);
            navigate(`/home`);
        })
        .catch((error) => {
            console.log("Error during login", error)
        });
    }
    return (
        <div className={"myBackground"}>
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
                <Box className={"itemBox"}>
                    <Link to="/register">Don't have an account? Register here</Link>
                </Box>  
            </Box>
        </form>
        </div>
    );
}

export default Login;