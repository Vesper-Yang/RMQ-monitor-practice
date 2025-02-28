import React from "react";
import { Badge } from "./ui/badge";

type MessageExampleProps = {
  label: string;
  content: string;
};

const MessageExample = ({ label, content }: MessageExampleProps) => {
  return (
    <div>
      <div>
        <Badge variant="outline" className="bg-brand/10 border-brand/80 mb-1">
          {label}
        </Badge>
        <div className="text-sm"> {content} </div>
      </div>
    </div>
  );
};

export default MessageExample;
