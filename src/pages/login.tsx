import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react"
import { firebaseApp, auth } from "./_app";
import { signInWithEmailAndPassword } from "firebase/auth";
import style from './login.module.scss';

export default function Login() {

    const router = useRouter();

    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');

    // const auth = useAuth0();

    const [isSubmitting, setSubmitting] = useState(false);
    const [isRedirecting, setRedirecting] = useState(false);

    function login() {
        setSubmitting(true);
        /*
                const data = new FormData();
                data.append('username', user);
                data.append('password', pass);
        
                axios.post('/api/v1/login', data).then(r => {
                    // setSubmitting(false);
                    router.push('/');
                }).catch(r => {
                    alert(r);
                    setSubmitting(false);
                });
        */
        // auth.loginWithRedirect();

        signInWithEmailAndPassword(auth, user, pass).then(credential => {
            console.log(credential);
            // setSubmitting(false);

            setRedirecting(true);
            setTimeout(() => {
                if (router.query.return_to)
                    router.push(router.query.return_to as string);
                else router.push('/board');
            }, 600);
        }).catch(e => {
            console.error(e);
            setSubmitting(false);
        });
    }

    return <div className={`${style.loginPage} ${isRedirecting ? style.redirecting : ''}`}>

        <div className={style.appDetails}>
            {/*
            <div className={style.header}>
                <p className={style.appLogo}></p>
                <div>
                    <h2>repo.myqualia</h2>
                    <p>Simple and easy to use project management solution.</p>
                </div>
            </div>

            <ul>
                <li feature-name="builds">
                    Automatically upload the latest builds of your project to the repository.
                </li>
                <li feature-name="issues">
                    Issue tracking feature allows you and your users to report issues, or suggest new features.
                </li>
                <li feature-name="sources">
                    Automatically uploads source code of your projects to the repository.
                </li>
            </ul>
            */}
        </div>

        <div className={style.loginContainer}>
            <a className={style.avatar}></a>
            <div className={style.form}>
                <input name="user" type="email" placeholder="Username" onInput={e => setUser((e.target as HTMLInputElement).value)} /><br />
                <input name="password" placeholder="Password" onInput={e => setPass((e.target as HTMLInputElement).value)} type="password" />

                <br />
                <button className={style.submit} type="submit" onClick={() => login()} disabled={isSubmitting}>Log In</button>
                {isSubmitting && <p>Logging in...</p>}
            </div>
        </div>
    </div>
}