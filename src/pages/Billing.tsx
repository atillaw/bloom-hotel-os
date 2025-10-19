import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

const Billing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Billing & Invoicing</h2>
        <p className="text-muted-foreground">Manage payments and invoices</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Billing System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon - Full billing and invoicing features</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
