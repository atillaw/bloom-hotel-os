import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const Housekeeping = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Housekeeping Management</h2>
        <p className="text-muted-foreground">Track cleaning schedules and maintenance</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Housekeeping System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon - Housekeeping task management</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Housekeeping;
