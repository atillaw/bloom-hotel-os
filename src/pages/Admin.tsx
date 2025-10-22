import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, CheckCircle, XCircle, Clock, ExternalLink, Copy } from "lucide-react";
import { AccessKeyDialog } from "@/components/AccessKeyDialog";


export default function Admin() {
  const [accessKeyDialogOpen, setAccessKeyDialogOpen] = useState(false);

  const { data: accessKeys, refetch } = useQuery({
    queryKey: ["access-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_keys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Panoya kopyalandı!");
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Bu erişim anahtarını silmek istediğinizden emin misiniz?")) return;
    
    try {
      const { error } = await supabase
        .from("access_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Erişim anahtarı silindi");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Silme işlemi başarısız");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Kontrol Paneli</h1>
          <p className="text-muted-foreground mt-1">Erişim anahtarlarını yönetin ve sistem üzerinde tam kontrol sağlayın</p>
        </div>
        <Button onClick={() => setAccessKeyDialogOpen(true)} size="lg">
          <Key className="w-4 h-4 mr-2" />
          Yeni Erişim Anahtarı
        </Button>
      </div>

      {/* Access Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle>Erişim Anahtarları ({accessKeys?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessKeys?.map((key) => (
              <div key={key.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono font-bold bg-muted px-3 py-1 rounded">
                        {key.access_key}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key.access_key)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {key.is_used ? (
                        <Badge variant="secondary">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Kullanıldı
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Aktif
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Müşteri:</span>{" "}
                        <span className="font-medium">{key.customer_name}</span>
                      </div>
                      {key.customer_email && (
                        <div>
                          <span className="text-muted-foreground">E-posta:</span>{" "}
                          <span className="font-medium">{key.customer_email}</span>
                        </div>
                      )}
                      {key.customer_phone && (
                        <div>
                          <span className="text-muted-foreground">Telefon:</span>{" "}
                          <span className="font-medium">{key.customer_phone}</span>
                        </div>
                      )}
                      {key.company_name && (
                        <div>
                          <span className="text-muted-foreground">Şirket:</span>{" "}
                          <span className="font-medium">{key.company_name}</span>
                        </div>
                      )}
                    </div>
                    {key.notes && (
                      <p className="text-sm bg-muted p-2 rounded">{key.notes}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Oluşturulma: {new Date(key.created_at).toLocaleString("tr-TR")}</span>
                      {key.is_used && key.used_at && (
                        <span>Kullanıldı: {new Date(key.used_at).toLocaleString("tr-TR")}</span>
                      )}
                    </div>
                  </div>
                  {!key.is_used && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!accessKeys || accessKeys.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Henüz erişim anahtarı oluşturulmadı
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AccessKeyDialog 
        open={accessKeyDialogOpen} 
        onOpenChange={setAccessKeyDialogOpen}
        onSuccess={() => {
          setAccessKeyDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}