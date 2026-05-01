import { Link } from "react-router";
import { Box, CircularProgress, Stack } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

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
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudQueueIcon sx={{ fontSize: 24, color: isLoading ? 'primary.main' : 'text.disabled' }} />
                {isLoading && <CircularProgress size={32} data-testid="global-spinner" sx={{ position: 'absolute', color: 'primary.main' }} />}
            </Box>
        </Stack>
    );
}