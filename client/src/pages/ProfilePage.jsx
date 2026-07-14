// client/src/pages/ProfilePage.jsx
import { UserProfile } from '@clerk/clerk-react';

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Profile Settings</h2>
        <p className="text-gray-400 text-sm">Manage your account details with Clerk</p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="min-h-[720px] bg-gray-950 p-4 sm:p-6">
          <UserProfile routing="path" path="/profile" afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;