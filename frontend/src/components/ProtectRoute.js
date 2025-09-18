import { useContext } from 'react'
import { UserContext } from '../App';
import { Navigate } from 'react-router-dom';

export default function ProtectRoute({ children, role }) {
    const { user } = useContext(UserContext);

    if (user === undefined) {
        return <div>Chergement...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
}
