import React from "react";
import { cn } from "../utils"
function Card({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="card"
        className={cn(
          "bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm",
          className,
        )}
        {...props}
      />
    );
  }

export default Card
