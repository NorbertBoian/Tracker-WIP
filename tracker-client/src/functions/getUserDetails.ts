import { emailChanged, usernameChanged } from "../slices/mainSlice/mainSlice";
import { store } from "../store";

const apiURL = `https://${import.meta.env.VITE_SERVER_URL}`;

export const getUserDetails = async () => {
  const { dispatch } = store;
  try {
    const result = await fetch(`${apiURL}/getuserdetails`, {
      method: "post",
      credentials: "include",
    });
    if (!result.ok) throw new Error();
    const { email, username } = await result.json();
    dispatch(emailChanged(email));
    dispatch(usernameChanged(username));
  } catch (err) {
    dispatch(emailChanged(false));
    dispatch(usernameChanged(false));
  }
};
