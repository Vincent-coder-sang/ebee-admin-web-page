import React from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Skeleton } from '@/components/ui/skeleton'; // Import ShadCN Skeleton

const Profile = () => {
  // Get user data from Redux state
  const { name, email, phoneNumber, userType, createdAt, status } = useSelector((state) => state.auth);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">User Profile</h2>

        {/* Display skeletons if data is loading */}
        {status === 'loading' ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <div>
            {/* Show user information */}
            {name ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2"><strong>Name:</strong> {name}</p>
                    <p className="text-lg font-medium text-gray-700 mb-2"><strong>Email:</strong> {email}</p>
                    <p className="text-lg font-medium text-gray-700 mb-2"><strong>Phone Number:</strong> {phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2"><strong>User Type:</strong> {userType}</p>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      <strong>Account Created On:</strong> {moment(createdAt).format('MMMM Do YYYY, h:mm:ss a')}
                    </p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button className="w-full md:w-48 py-2 px-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-lg focus:outline-none">
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">No user information available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
