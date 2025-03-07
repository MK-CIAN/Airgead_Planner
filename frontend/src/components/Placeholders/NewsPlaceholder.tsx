import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewsPlaceholder() {
  const navigate = useNavigate();

  return (
    <Card className="w-full h-full p-6 flex flex-col justify-center items-center text-center border border-dashed">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Want to Keep Up to Date with Relevant News?</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center flex-grow">
        <div className="w-16 h-16 flex items-center justify-center rounded-full mb-4">
          <Newspaper className="w-16 h-16 text-green-500" />
        </div>
        <p className="text-muted-foreground mb-4">
          Financial news cant be difficult to find, register your money interests to get personalised news articles.
        </p>
        <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => navigate("/userinterests")}>
          Register Your Interests
        </Button>
      </CardContent>
    </Card>
  );
}
