import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";

export default function AppLoader() {
    return (
        <Backdrop open={true} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Stack alignItems="center" spacing={2}>
                <CircularProgress color="inherit" size={60} />
                <Typography variant="h6">Time2Task</Typography>
            </Stack>
        </Backdrop>
    );
}
