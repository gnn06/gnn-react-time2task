import { Link } from "react-router-dom";
import Logout from './logout';
import { RELEASE } from './changelog'

export default function AppMenu() {
    return <div className="m-1">
        <Link to="/settings">Settings</Link> <Link to="/help">Aide Méthodo</Link> <Link to="/changelog">Version {RELEASE}</Link> <Logout />
    </div>
}