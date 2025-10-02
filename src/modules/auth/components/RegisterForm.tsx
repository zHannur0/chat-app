'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignUpEmailMutation } from "@/modules/auth/api/authApi";

const RegisterForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signUpEmail, { isLoading }] = useSignUpEmailMutation();

    const handleRegister = async () => {
        if (!email || !password) return;
        try {
            const res = await signUpEmail({ email, password }).unwrap();
            localStorage.setItem('idToken', res.idToken);
            router.push('/chat');
        } catch {
            // optional: show error toast
        }
    };

    const goLogin = () => router.push('/login');

    return (
        <div className="flex flex-col w-full max-w-[380px] p-6">
            <p className="text-sm mb-2">WELCOME 👋🏻</p>
            <h1 className="text-[30px] font-bold mb-8">Create your Account.</h1>
            <div className="mt-2 flex flex-col gap-3">
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
                    autoComplete="new-password"
                />
                <div className="flex gap-2">
                    <button className="flex-1 rounded-md bg-primary text-white h-10" onClick={handleRegister} disabled={isLoading}>Create Account</button>
                    <button className="flex-1 rounded-md bg-background text-inverse border border-border h-10" onClick={goLogin}>I have an account</button>
                </div>
            </div>
        </div>
    )
}

export default RegisterForm;


