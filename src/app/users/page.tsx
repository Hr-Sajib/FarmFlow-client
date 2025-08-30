'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { redirect } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TCurrentUser, UserRole } from '@/types/types';
import { useGetAllUsersQuery } from '@/redux/features/currentUser/currentUserApi';
import { User, Mail, Phone, MapPin, Clock, Pen } from 'lucide-react';
import CreateUserModal from '@/components/admin/CreateUser';
import UpdateUserModal from '@/components/admin/UpdateUser';


export default function UsersPage() {
  const { currentUser } = useAppSelector((state: RootState) => state.currentUser);
  const { data: usersResponse, isLoading, error } = useGetAllUsersQuery();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TCurrentUser | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect non-admins or non-logged-in users
  useEffect(() => {
    if (isRedirecting) return; // Prevent multiple redirects

    if (!currentUser) {
      console.log('UsersPage - No user logged in, redirecting to /login');
      setIsRedirecting(true);
      toast.error('Please log in to access Users Management');
      redirect('/login');
    } else if (currentUser.role !== UserRole.Admin) {
      console.log('UsersPage - User is not admin, redirecting to /');
      setIsRedirecting(true);
      toast.error('Access denied: Admins only');
      redirect('/');
    }
  }, [currentUser, isRedirecting]);

  // Handle API error
  if (error) {
    console.error('UsersPage - Error fetching users:', error);
    return (
      <div className="p-4 max-w-6xl mx-auto pt-20">
        <h1 className="text-2xl font-bold text-green-800 mb-4">Users Management</h1>
        <p className="text-red-600">Failed to load users. Please try again.</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-6xl mx-auto pt-20">
        <h1 className="text-2xl font-bold text-green-800 mb-4">Users Management</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 shadow-md p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="bg-gray-100 p-3 rounded-md space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Extract users from response
  const users: TCurrentUser[] = usersResponse?.data || [];

  return (
    <div className="p-4 max-w-6xl mx-auto pt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Users Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Create New User
        </button>
      </div>
      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg border border-gray-200 shadow-md p-6 hover:shadow-lg transform transition-shadow duration-300"
            >
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-green-800">{user.name}</h2>
                </div>
                <p className="text-sm text-gray-600">Role: {user.role}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Farmer ID: {user.farmerId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>Email: {user.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Phone: {user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Address: {user.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Status: {user.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Total Fields: {user.fieldIds.length}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  className="inline-flex items-center justify-center bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-600 transition-colors duration-200"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <Pen className="h-5 w-5 mr-2" /> Edit User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      {selectedUser && (
        <UpdateUserModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
}