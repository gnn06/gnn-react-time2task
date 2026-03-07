import { Link } from "react-router-dom";
import { Stack } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

import Logout from './logout';
import { RELEASE } from './changelog'

export default function AppMenu() {
    return <Stack direction="row" alignItems="center" gap={1} padding={0} margin={0}>
        <MenuIcon />
        <span>Time2Task</span>
        <Link to="/settings">Settings</Link> <Link to="/help">Aide Méthodo</Link> <Link to="/changelog">Version {RELEASE}</Link> <Logout />
    </Stack>
}