import "../../App.css";
import { Box } from "@mui/system";
import MyTextField from "../forms/MyTextField";
import MyPassField from "../forms/MyPassField";
import MyButton from "../forms/MyButton";
import { Link } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import Axios from "../Axios";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface IFormInput {
  email: string;
  username: string; // Add username
  password: string;
  password2: string; // Include password confirmation
}

const Register = () => {
  const navigate = useNavigate();

  const schema = yup.object({
    email: yup
      .string()
      .email("Field expects an email address")
      .required("Email is a required field"),
    username: yup
      .string()
      .required("Username is a required field")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters"),
    password: yup
      .string()
      .required("Password is a required field")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%&*(),.?":;{}|<>+]/,
        "Password must contain at least one special character"
      ),
    password2: yup
      .string()
      .required("Password confirmation is a required field")
      .oneOf([yup.ref("password")], "Passwords must match"),
  });

  const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) });

  const submission: SubmitHandler<IFormInput> = (data) => {
    Axios.post(`register/`, {
      email: data.email,
      username: data.username, // Include username
      password: data.password,
    })
      .then(() => {
        navigate(`/`);
      })
      .catch((error) => {
        console.error("Error during registration:", error);
      });
  };

  return (
    <div className={"myBackground"}>
      <form onSubmit={handleSubmit(submission)}>
        <Box className={"whiteBox"}>
          <Box className={"itemBox"}>
            <Box className={"title"}>User Registration</Box>
          </Box>
          <Box className={"itemBox"}>
            <MyTextField
              label={"Username"}
              name={"username"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"}>
            <MyTextField label={"Email"} name={"email"} control={control} />
          </Box>
          <Box className={"itemBox"}>
            <MyPassField
              label={"Password"}
              name={"password"}
              control={control}
            />
          </Box>

          <Box className={"itemBox"}>
            <MyPassField
              label={"Confirm Password"}
              name={"password2"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"}>
            <MyButton type={"submit"} label={"Register"} />
          </Box>
          <Box className={"itemBox"}>
            <Link to="/">Already Registered? Log In Here!</Link>
          </Box>
        </Box>
      </form>
    </div>
  );
};

export default Register;
