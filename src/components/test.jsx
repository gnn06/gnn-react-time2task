import { Link } from "@mui/material";


function Test() {
  return <>
    <div><Link href="#/test/taskdialog" rel="noopener">dialog</Link></div>
    <div><Link href="#/test/filter" rel="noopener">filter</Link></div>
    <div><Link href="#/test/slotselect" rel="noopener">slot select</Link></div>
    <div><Link href="#/test/slotpickerbutton" rel="noopener">slot picker button</Link></div>
  </>;
}

export default Test;