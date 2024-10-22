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

const Register = () => {
    const navigate = useNavigate();
    const { handleSubmit, control } = useForm<IFormInput>();

    const submission: SubmitHandler<IFormInput> = (data) => {
        Axios.post(`register/`, {
            email: data.email,
            password: data.password
        }).then(() => {
            navigate(`/`);
        });
    }

    return (
        <div className={"myBackground"}>

            <form onSubmit={handleSubmit(submission)}>
            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>User Registration</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField label={"Email"}
                    name = {"email"}
                    control = {control}
                    />
                </Box>
                <Box className={"itemBox"}>
                    <MyPassField label={"Password"}
                    name = {"password"}
                    control = {control} />
                </Box>

                <Box className={"itemBox"}>
                    <MyPassField label={"Confirm Password"}
                    name = {"password2"}
                    control = {control} />
                </Box>
                <Box className={"itemBox"}>
                    <MyButton 
                    type={"submit"}
                    label={"Register"} />
                </Box>
                <Box className={"itemBox"}>
                    <Link to="/">Already Registered? Log In Here!</Link>
                </Box>
                
            </Box>
            </form>
        </div>
    );
}

export default Register;