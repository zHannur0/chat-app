'use client'

import RegisterForm from '@/modules/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}


