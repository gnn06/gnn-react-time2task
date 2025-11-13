import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

import { supabase } from '../services/supabase'
import { login, accessToken, setSlotViewFilterConf, setSlotViewFilterConfView } from "../features/taskSlice";
import { storeUser, storeAccessToken, removeUser, removeAccessToken } from "../services/browser-storage";
// import { useLazyGetUserConfQuery } from "../features/apiSlice";

export default function Login({isSignIn}) {

    // const [triggerGetUserConf] = useLazyGetUserConfQuery();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') {
            // handle token refreshed event
            console.info('token refresh', session)
            // session contains access_token, expires_at, refresh_token, user.{id, email}
            storeAccessToken(session.access_token)
            dispatch(accessToken(session.access_token))
        }
      })

    async function loginHandle(e) {
        e.preventDefault()
        const formData = new FormData(e.target);
        const { data, error } = 
            isSignIn ? await supabase.auth.signInWithPassword({
                        email: formData.get('email'),
                        password: formData.get('password'),
                    })
                : await supabase.auth.signUp({
                    email: formData.get('email'),
                    password: formData.get('password'),
                })
        /* SignIn
            OK => data.user.id = a1162... , data.user.email = gilles.orsini@gmail.com,  error = null
                  data.session.access_token "qsdqsdqsd"
            KO => error.message = 'Invalid login credentials'
           SignUp
            OK => data.session = ... , data.user= ...  
            KO => error.message
        */
        if (!error) {
            storeUser(data.user.id, data.user.email)
            storeAccessToken(data.session.access_token)
            const user = { id: data.user.id, email: data.user.email }
            dispatch(login(user));
            dispatch(accessToken(data.session.access_token));

            // Inutile comme la récupération est faite dans App.jsx
            // récupérer la conf utilisateur stocké et hydrater le store
            // try {
            //   const res = await triggerGetUserConf({ userId: data.user.id });
            //   console.debug("Conf utilisateur chargé :", res);
            //   if (res && res.data) {
            //     dispatch(setSlotViewFilterConfView({ view: res.data }));
            //   }
            // } catch (e) {
            //   console.warn("Impossible de charger le filtre utilisateur :", e);
            // }

            navigate('/')
        } else {
            alert(error.message)
            console.error(error.message)
            removeUser()
            removeAccessToken();
            const user = { id: '', email: '', accessToken: ''}
            dispatch(login(user));
            dispatch(accessToken(data.session.access_token));
        }
    }

    return (
    <div className="h-screen flex items-center justify-center" >
        <div className="w-full max-w-xs">
            <form className="bg-white" method="post" onSubmit={loginHandle}>
                <div className="mb-1">
                    <label className="block text-sm font-bold mb-1" htmlFor="email">Login</label>
                    <input className="shadow appearance-none border rounded focus:shadow-outline-none py-1 px-2 w-full leading-tigth" id="email" name="email" type="text" placeholder="user@domain.com" />
                </div>
                
                <div className="mb-3">
                    <label className="block text-sm font-bold mb-1" htmlFor="password">Password</label>
                    <input className="shadow appearance-none border rounded focus:shadow-outline-none py-1 px-2 w-full leading-tigth" id="password" name="password" type={isSignIn ? "password" : "text"} placeholder={isSignIn ? "******************" : "mot de passe"}/>
                </div>
                <Button type="submit" variant="contained" >{isSignIn ? "Login" : "Sign up"}</Button>
            </form>
        </div>
    </div>)
    }