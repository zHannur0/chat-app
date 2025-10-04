'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignInEmailMutation } from "@/modules/auth/api/authApi";
import { validatePassword } from "@/modules/auth/lib/validation";
import ErrorMessage from "@/shared/components/ui/ErrorMessage";

const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
    const [signInEmail] = useSignInEmailMutation();

    const validateForm = () => {
        const newErrors: {email?: string; password?: string; general?: string} = {};
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        const passwordError = validatePassword(password);
        if (passwordError) newErrors.password = passwordError;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async () => {
        if (!validateForm()) return;
        
        setIsLoading(true);
        setErrors({});
        
        try {
            const res = await signInEmail({ email, password }).unwrap();
            localStorage.setItem('idToken', res.idToken);
            router.push('/chat');
        } catch (error: any) {
            console.error('Login failed:', error);
            
            // Handle different error types
            if (error?.data?.error?.includes('INVALID_EMAIL')) {
                setErrors({ email: 'Invalid email format' });
            } else if (error?.data?.error?.includes('INVALID_PASSWORD')) {
                setErrors({ password: 'Incorrect password' });
            } else if (error?.data?.error?.includes('EMAIL_NOT_FOUND')) {
                setErrors({ email: 'Email not found' });
            } else {
                setErrors({ general: 'Login failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const goRegister = () => router.push('/register');

    return (
        <div className="flex flex-col w-full max-w-[380px] p-6">
            <p className="text-sm mb-2">WELCOME BACK 👋🏻</p>
            <h1 className="text-[30px] font-bold mb-4">Continue to your Account.</h1>
            {/* <button className="flex items-center gap-2 justify-center rounded-4xl bg-primary text-white h-14" onClick={handleGoogle} disabled={inProgressRef.current}>
                <img src="/icons/google.svg" alt="google" />
                <p>Continue with Google</p>
            </button> */}
            <div className="mt-6 flex flex-col gap-3">
                <div>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className={`w-full rounded-md bg-transparent outline-none border px-3 py-2 text-inverse ${
                            errors.email ? 'border-red-500' : 'border-border'
                        }`}
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                    />
                    <ErrorMessage message={errors.email} />
                </div>
                
                <div>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className={`w-full rounded-md bg-transparent outline-none border px-3 py-2 text-inverse ${
                            errors.password ? 'border-red-500' : 'border-border'
                        }`}
                        type="password"
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                    <ErrorMessage message={errors.password} />
                </div>

                {errors.general && (
                    <ErrorMessage message={errors.general} className="text-center" />
                )}

                <div className="flex gap-2">
                    <button 
                        className="flex-1 rounded-md bg-primary text-white h-10 disabled:opacity-50" 
                        onClick={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <button 
                        className="flex-1 rounded-md bg-background text-inverse border border-border h-10" 
                        onClick={goRegister}
                        disabled={isLoading}
                    >
                        Create Account
                    </button>
                </div>
            </div>
           
        </div>
    )
}

export default LoginForm;