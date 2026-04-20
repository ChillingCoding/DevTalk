import  React from "react";
import { cn } from "../utils";
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="card-footer"
        className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
        {...props}
      />
    );
  }
export default CardFooter