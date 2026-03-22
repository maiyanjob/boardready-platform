import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Candidates', path: '/candidates' },
  { name: 'Boards', path: '/boards' },
  { name: 'AI Search', path: '/search' },
  { name: 'Match', path: '/match' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4">
      <div className="text-white text-2xl font-bold mb-8">
        BoardReady
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
