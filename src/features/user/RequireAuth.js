// RequireAuth.js
import { useAuth } from "../../context/AuthContext";
import { Navigate, useLocation } from 'react-router-dom';
import Loader from "../../common/loader/Loader";

export default function RequireAuth({ children }) {
    const { isLoggedIn, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) {
        return (
            <main>
                <Loader />
            </main>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to={`/user/login?next=${location.pathname}`} replace />;
    }

    return children;
}
