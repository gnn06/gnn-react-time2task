import Logout from './logout';
import { Link } from "react-router-dom";

export default function AppMenu() {
    return <div className="m-1">
        <Link to="/help">Aide Méthodo</Link> <Link to="/changelog">Changelog</Link> <Logout />
    </div>
}