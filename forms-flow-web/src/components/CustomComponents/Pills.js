import Badge from "react-bootstrap/Badge";
import { CloseIcon } from "@formsflow/components";

const CustomPill = ({ label, icon, bg }) => {
  return (
    <div>
      <Badge pill variant={bg}>
        {label} {icon && <CloseIcon color="#253DF4"/>}
      </Badge>{" "}
    </div>
  );
};

export default CustomPill;
