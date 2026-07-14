// client/src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
    <div className="text-center">
      <p className="text-8xl font-bold text-gray-800 select-none">404</p>
      <h1 className="text-2xl font-bold text-white mt-4">Page Not Found</h1>
      <p className="text-gray-400 text-sm mt-2">
        The route you're looking for doesn't exist.
      </p>
      <Link to="/dashboard" className="btn-primary inline-block mt-6">
        Return to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;