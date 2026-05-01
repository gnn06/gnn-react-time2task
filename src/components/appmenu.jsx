import { Link } from "react-router";
import { CircularProgress, Stack } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

import Logout from './logout';
import { RELEASE } from './changelog';
import { useGlobalLoading } from '../hooks/useGlobalLoading';

export default function AppMenu() {
    const isLoading = useGlobalLoading();

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: "center",
                gap: 1,
                padding: 0,
                margin: 0
            }}>
            <MenuIcon />
            <span>Time2Task</span>
            <Link to="/settings">Settings</Link> <Link to="/help">Aide Méthodo</Link> <Link to="/changelog">Version {RELEASE}</Link> <Logout />
            {isLoading && <CircularProgress size={20} data-testid="global-spinner" />}
        </Stack>
    );
}