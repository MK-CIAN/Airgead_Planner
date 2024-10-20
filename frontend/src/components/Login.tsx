import '../App.css';
import { Box } from '@mui/system';
import MyTextField from './forms/MyTextField';
import MyPassField from './forms/MyPassField';

const Login = () => {
    return (
        <div className={"myBackground"}>
            <Box className={"whiteBox"}>
                <Box className={"itemBox"}>
                    <Box className={"title"}>Login for Airgead Planner</Box>
                </Box>
                <Box className={"itemBox"}>
                    <MyTextField label={"Email"} />
                </Box>
                <Box className={"itemBox"}>
                    <MyPassField label={"Password"} />
                </Box>
                <Box className={"itemBox"}>
                    Submit Button
                </Box>
                <Box className={"itemBox"}>
                    Link to Register Page
                </Box>
                
            </Box>
        </div>
    );
}

export default Login;