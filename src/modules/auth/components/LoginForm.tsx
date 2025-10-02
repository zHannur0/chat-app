'use client'
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { completeRedirectAndGetIdToken, startGoogleRedirect } from "@/modules/auth/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useSignInEmailMutation, useSignUpEmailMutation } from "@/modules/auth/api/authApi";

const LoginForm = () => {
    const router = useRouter();
    const inProgressRef = useRef(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signInEmail] = useSignInEmailMutation();
    const [signUpEmail] = useSignUpEmailMutation();

    useEffect(() => {
        let unsub: (() => void) | undefined;
        (async () => {
            const idToken = await completeRedirectAndGetIdToken();
            console.log('idToken', idToken);
            if (idToken) {
                localStorage.setItem('idToken', idToken);
                router.push('/chat');
                return;
            }
            // Fallback: wait for auth state and then get token
            try {
                unsub = onAuthStateChanged(getAuth(), async (user) => {
                    if (!user) return;
                    try {
                        const t = await user.getIdToken();
                        localStorage.setItem('idToken', t);
                        router.push('/chat');
                    } catch {}
                });
            } catch {}
        })();
        return () => { try { unsub && unsub(); } catch {} };
    }, [router]);

    const handleGoogle = async () => {
        if (inProgressRef.current) return;
        inProgressRef.current = true;
        try {
            await startGoogleRedirect();
        } catch {
            inProgressRef.current = false;
        }
    };

    const handleEmailSignIn = async () => {
        if (!email || !password) return;
        try {
            const res = await signInEmail({ email, password }).unwrap();
            localStorage.setItem('idToken', res.idToken);
            router.push('/chat');
        } catch {
            // silent
        }
    };

    const goRegister = () => router.push('/register');

    return (
        <div className="flex flex-col w-full max-w-[380px] p-6">
            <p className="text-sm mb-2">WELCOME BACK 👋🏻</p>
            <h1 className="text-[30px] font-bold mb-8">Continue to your Account.</h1>
            <button className="flex items-center gap-2 justify-center rounded-4xl bg-primary text-white h-14" onClick={handleGoogle} disabled={inProgressRef.current}>
                <img src="/icons/google.svg" alt="google" />
                <p>Continue with Google</p>
            </button>
            <div className="mt-6 flex flex-col gap-3">
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-md bg-transparent outline-none border border-border px-3 py-2 text-inverse"
                    type="email"
                    autoComplete="email"
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-md bg-transparent outline-none border border-border px-3 py-2 text-inverse"
                    type="password"
                    autoComplete="current-password"
                />
                <div className="flex gap-2">
                    <button className="flex-1 rounded-md bg-primary text-white h-10" onClick={handleEmailSignIn}>Sign In</button>
                    <button className="flex-1 rounded-md bg-background text-inverse border border-border h-10" onClick={goRegister}>Create Account</button>
                </div>
            </div>
           
        </div>
    )
}

export default LoginForm;