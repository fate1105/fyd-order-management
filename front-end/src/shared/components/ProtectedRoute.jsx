import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, hasPermission } from "@shared/utils/authSession";

/**
 * A component that wraps protected routes.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.permission] - Optional permission required to access the route
 * @param {string} [props.redirectTo] - Where to redirect if not authorized (default: /admin/login)
 */
const ProtectedRoute = ({ children, permission, redirectTo = "/admin/login" }) => {
    const location = useLocation();

    if (!isLoggedIn()) {
        // Redirect to login but save the current location to redirect back after login
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (permission && !hasPermission(permission)) {
        // If user is logged in but doesn't have the required permission
        // For now, redirect to admin dashboard or a 403 page
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;
