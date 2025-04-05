import { ReactNode, useState, useEffect } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Axios from "@/components/Services/Axios"; // Import Axios for API requests

interface FeatureTooltipProps {
  content: string;
  children: ReactNode;
}

const FeatureTooltip: React.FC<FeatureTooltipProps> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);

  // Detect touch devices
  useEffect(() => {
    const handleTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", handleTouch);
    return () => window.removeEventListener("touchstart", handleTouch);
  }, []);

  // Auto-close tooltip after 7.5 seconds on mobile
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isTouch) {
      timer = setTimeout(() => setIsOpen(false), 7500);
    }
    return () => clearTimeout(timer);
  }, [isOpen, isTouch]);

  // Fetch tooltip preference from backend
  useEffect(() => {
    Axios.get("user", {
      headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((res) => {
        if (res.data.tooltips_enabled !== undefined) {
          setTooltipsEnabled(res.data.tooltips_enabled);
        }
      })
      .catch((err) => console.error("Error fetching tooltip preference:", err));
  }, []);

  if (!tooltipsEnabled) return children; // Disable tooltips if toggled off in backend

  return (
    <Tooltip 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      delayDuration={0} 
      disableHoverableContent={true}
    >
      <TooltipTrigger asChild>
        <div 
          onClick={() => setIsOpen(true)} 
          onMouseEnter={() => { if (!isTouch) setIsOpen(true); }} 
          onMouseLeave={() => { if (!isTouch) setIsOpen(false); }}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-green-500 text-white px-3 py-2 rounded-md shadow-lg">
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default FeatureTooltip;
