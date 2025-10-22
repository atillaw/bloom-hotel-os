import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function SetupAdmin() {
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setup-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Setup failed");
      }

      toast.success("Admin hesabı başarıyla oluşturuldu! Giriş yapabilirsiniz.");
    } catch (error: any) {
      toast.error(error.message || "Admin kurulumu başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center shadow-ocean">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Kurulumu</CardTitle>
          <CardDescription>
            Admin hesabını oluşturmak için butona tıklayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Email:</strong> atillaoyunda51@gmail.com</p>
              <p><strong>Şifre:</strong> 951753A.t</p>
            </div>
            <Button onClick={handleSetup} className="w-full" size="lg" disabled={loading}>
              {loading ? "Kuruluyor..." : "Admin Hesabı Oluştur"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Bu butonu sadece bir kez tıklayın. Hesap oluşturulduktan sonra giriş yapabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
