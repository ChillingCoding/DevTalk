import  React from "react";
import { cn } from "../utils";

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <h4
        data-slot="card-title"
        className={cn("leading-none", className)}
        {...props}
      />
    );
  }

export default CardTitle