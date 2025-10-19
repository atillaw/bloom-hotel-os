import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const Housekeeping = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Kat Hizmetleri Yönetimi</h2>
        <p className="text-muted-foreground">Temizlik programlarını ve bakımları takip edin</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Kat Hizmetleri Sistemi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Yakında - Görev yönetimi özellikleri</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Housekeeping;
