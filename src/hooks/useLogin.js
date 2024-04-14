import { useAuth } from "~/contexts/AuthContext";

import useAxiosPrivate from "./useAxiosPrivate";
import config from "../constants/endpoints.json";

const currentConfig = import.meta.env.MODE === "development" ? config.test : config.prod;
const useLogin = () => {
  const { setAuthState } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const login = async ({ email, password }) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const response = await axiosPrivate.post(currentConfig.login, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    const authData = response.data;

    const data = {
      token: {
        refresh: "asdnaksldn",
        accessToken: authData.token
      },
      user: {
        name: "Esteban",
        email
      }
    };
    localStorage.setItem("auth", JSON.stringify(data));
    setAuthState(data);
  };

  return { login };
};

export default useLogin;
