import Button from '@mui/material/Button';

export default function BasicButtons(props: any) {
const {label, type} = props
  return (
      <Button type = {type} variant="contained" className={"myButton"}>
        {label}
      </Button>
  );
}