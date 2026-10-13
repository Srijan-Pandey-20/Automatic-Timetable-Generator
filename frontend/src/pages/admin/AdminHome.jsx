import { useAuth } from '../../context/AuthContext';

export default function AdminHome() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome, {user?.name}</h2>
      <p className="text-gray-500 mb-6">Admin overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Branches</p>
          <p className="text-2xl font-semibold text-gray-800">—</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Sections</p>
          <p className="text-2xl font-semibold text-gray-800">—</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Faculty</p>
          <p className="text-2xl font-semibold text-gray-800">—</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rooms</p>
          <p className="text-2xl font-semibold text-gray-800">—</p>
        </div>
      </div>
    </div>
  );
}