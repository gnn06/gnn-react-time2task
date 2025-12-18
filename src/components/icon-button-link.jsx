import { IconButton, Link } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * IconButtonLink
 * Props:
 *  - href: string (url)
 *  - ariaLabel: string
 *  - target, rel, sx, size, ...props forwarded to IconButton
 */
export default function IconButtonLink({ href, fontSize="medium", color = "black", sx, ...props }) {
  return (
    <IconButton
      component={Link}
      href={href || "#"}
      aria-label="Lien externe"
      target="_blank"
      rel="noopener noreferrer"
      sx={sx}
      {...props}
    >
      <OpenInNewIcon fontSize={fontSize} style={{ color: color }}/>
    </IconButton>
  );
}