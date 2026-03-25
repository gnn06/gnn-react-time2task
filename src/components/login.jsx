import { useDispatch } from "react-redux";
import { Button } from "@mui/material";

import { supabase } from '../services/supabase'
import { login, accessToken } from "../features/taskSlice";
import { localStoreAccessToken, localRemoveUser, localRemoveAccessToken } from "../services/browser-storage";
import { loginThunk } from "../features/auth-thunk";

export default function Login({isSignIn}) {

    const dispatch = useDispatch();

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') {
            // handle token refreshed event
            console.info('token refresh', session)
            // session contains access_token, expires_at, refresh_token, user.{id, email}
            localStoreAccessToken(session.access_token)
            dispatch(accessToken(session.access_token))
        }
      })

    async function loginHandle(e) {
        e.preventDefault()
        const formData = new FormData(e.target);
        try {
            await dispatch(loginThunk(formData.get('email'), formData.get('password')));
        } catch (error) {
            alert(error.message)
            console.error(error.message)
            localRemoveUser()
            localRemoveAccessToken();
            const user = { id: '', email: '', accessToken: ''}
            dispatch(login(user));
            dispatch(accessToken(''));
        }
    }

    return (
    <div className="h-screen flex items-center justify-center" >
        <div className="w-full max-w-xs">
            <form className="bg-white" method="post" onSubmit={loginHandle}>
                <div className="mb-1">
                    <label className="block text-sm font-bold mb-1" htmlFor="email">Login</label>
                    <input className="shadow appearance-none border rounded focus:shadow-outline-none py-1 px-2 w-full leading-tigth" id="email" name="email" aria-label="email" type="text" placeholder="user@domain.com" />
                </div>
                
                <div className="mb-3">
                    <label className="block text-sm font-bold mb-1" htmlFor="password">Password</label>
                    <input className="shadow appearance-none border rounded focus:shadow-outline-none py-1 px-2 w-full leading-tigth" id="password" name="password" aria-label="password" type={isSignIn ? "password" : "text"} placeholder={isSignIn ? "******************" : "mot de passe"}/>
                </div>
                <Button type="submit" variant="contained" >{isSignIn ? "Login" : "Sign up"}</Button>
            </form>
        </div>
    </div>)
    }