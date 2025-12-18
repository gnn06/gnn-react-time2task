import React from "react";
import { IconButton } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function FavoriteToggle({ favorite = false, onToggle, size = 40, color = "black", ...props }) {
    return (
        <IconButton aria-label={"favorite"} onClick={onToggle} {...props} >
            {favorite ? <StarIcon style={{ color: color }} sx={{ fontSize: size }} /> : <StarBorderIcon style={{ color: color }} sx={{ fontSize: size }} />}
        </IconButton>
    );
}