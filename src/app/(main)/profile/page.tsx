'use client'

import { useGetProfileQuery, useUpdateProfileMutation } from '@/modules/profile/api/profileApi';
import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export default function ProfilePage() {
  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    if (data) {
      setDisplayName(data.displayName || '');
      setPhotoURL(data.photoURL || '');
    }
  }, [data]);

  const onSave = async () => {
    await updateProfile({ displayName, photoURL }).unwrap().catch(() => {});
  };

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>
      <div className="bg-white rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <Input value={data?.email || ''} disabled />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Display name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Photo URL</label>
          <Input value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://..." />
        </div>
        <div className="pt-2">
          <Button onClick={onSave} disabled={saving || isLoading}>Save</Button>
        </div>
      </div>
    </div>
  );
}


