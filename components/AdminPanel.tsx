import React from 'react';
import type { User } from '../types';

interface AdminPanelProps {
    allUsers: User[];
    setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentUser: User;
    onBack: () => void;
}

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, setAllUsers, currentUser, onBack }) => {

    const handleMakeAdmin = (usernameToPromote: string) => {
        const updatedUsers = allUsers.map(user => {
            if (user.username === usernameToPromote) {
                return { ...user, role: 'admin' as 'admin' };
            }
            return user;
        });
        setAllUsers(updatedUsers);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
                <button
                    onClick={onBack}
                    className="flex items-center justify-center px-4 py-2 bg-[rgb(var(--bg-interactive-rgb))] text-primary font-semibold rounded-lg shadow-md hover:bg-[rgb(var(--bg-interactive-hover-rgb))] transition-all duration-200"
                >
                    <BackIcon />
                    Back to Editor
                </button>
            </div>

            <div className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4 text-primary border-b border-[rgba(var(--border-rgb),0.1)] pb-3">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-muted uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Username
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((user, index) => (
                                <tr key={user.username} className={`border-b border-[rgba(var(--border-rgb),0.1)] ${index === allUsers.length -1 ? 'border-b-0' : ''}`}>
                                    <th scope="row" className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                                        {user.username} {user.username === currentUser.username && <span className="text-xs text-muted font-normal">(You)</span>}
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700 text-slate-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'user' && (
                                            <button
                                                onClick={() => handleMakeAdmin(user.username)}
                                                className="px-3 py-1 bg-[var(--accent-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--accent-secondary)] transition-colors"
                                            >
                                                Make Admin
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};