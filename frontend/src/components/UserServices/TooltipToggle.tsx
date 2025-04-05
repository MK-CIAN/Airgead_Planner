import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import Axios from "@/components/Services/Axios";

const TooltipToggle = () => {
  const [tooltipsEnabled, setTooltipsEnabled] = useState<boolean | null>(null); // Start as null

  // Fetch user preference on mount
  useEffect(() => {
    Axios.get("user", {
      headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
    })
      .then((res) => {
        console.log("API Response:", res.data); // Debugging API response
        if (res.data.tooltips_enabled !== undefined) {
          setTooltipsEnabled(res.data.tooltips_enabled);
          console.log("Tooltips Enabled State Set To:", res.data.tooltips_enabled);
        } else {
          console.warn("tooltips_enabled key is missing in API response");
        }
      })
      .catch((err) => {
        console.error("Error fetching tooltip preference:", err);
        setTooltipsEnabled(false); // Fallback to false if request fails
      });
  }, []);

  // Toggle tooltips and update backend
  const toggleTooltips = async () => {
    if (tooltipsEnabled === null) {
      console.warn("Tried to toggle tooltips before state was set");
      return; // Prevent toggling before state is set
    }

    const newState = !tooltipsEnabled;
    setTooltipsEnabled(newState); // Instantly update UI

    try {
      await Axios.post("toggle-tooltips/", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      });
    } catch (error) {
      console.error("Error toggling tooltips:", error);
      setTooltipsEnabled(!newState); // Revert if API call fails
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Tooltips</span>
      {tooltipsEnabled !== null ? (
        <Switch
          checked={tooltipsEnabled}
          onCheckedChange={toggleTooltips}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300" // Custom Tailwind classes
        />
      ) : (
        <span className="text-sm text-gray-500">Loading...</span>
      )}
    </div>
  );
};

export default TooltipToggle;
