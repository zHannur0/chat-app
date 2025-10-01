'use client'
import { useSignInGoogleMutation } from "@/modules/auth/api/authApi";
import { getGoogleIdTokenOneTap } from "@/modules/auth/lib/google";
import { useRouter } from "next/navigation";

const LoginForm = () => {
    const router = useRouter();
    const [signInGoogle] = useSignInGoogleMutation();

    const handleGoogle = async () => {
        try {
            const googleIdToken = await getGoogleIdTokenOneTap();
            console.log('[auth] google one-tap credential received', googleIdToken?.slice(0, 20) + '...');
            const res = await signInGoogle({ idToken: googleIdToken }).unwrap();
            if (typeof window !== 'undefined') {
                localStorage.setItem('idToken', res.idToken);
                console.log('[auth] firebase idToken saved', res.idToken?.slice(0, 20) + '...');
                router.push('/chat');
            }
        } catch (e) {
            console.error('[auth] google sign-in failed', e);
            alert('Google sign-in failed. Check console for details.');
        }
    };

    return (
        <div className="flex flex-col w-full max-w-[380px] p-6">
            <p className="text-sm mb-2">WELCOME BACK 👋🏻</p>
            <h1 className="text-[30px] font-bold mb-8">Continue to your Account.</h1>
            <button className="flex items-center gap-2 justify-center rounded-4xl bg-primary text-white h-14" onClick={handleGoogle}>
                <img src="/icons/google.svg" alt="google" />
                <p>Continue with Google</p>
            </button>
           
        </div>
    )
}

export default LoginForm;