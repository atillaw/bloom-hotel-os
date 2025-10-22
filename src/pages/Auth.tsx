import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Hotel, Key } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if access key exists and is not used
      const { data: keyData, error: keyError } = await supabase
        .from("access_keys")
        .select("*")
        .eq("access_key", accessKey.toUpperCase().trim())
        .eq("is_used", false)
        .maybeSingle();

      if (keyError) throw keyError;
      if (!keyData) {
        toast.error("Geçersiz veya kullanılmış erişim anahtarı");
        setLoading(false);
        return;
      }

      // Generate credentials for the customer
      const email = `${accessKey.toLowerCase().replace(/-/g, "")}@tsdmr.hotel`;
      const password = accessKey + "-TSDMR2025";

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Kullanıcı oluşturulamadı");

      // Assign customer role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "customer",
      });

      if (roleError) throw roleError;

      // Mark key as used
      const { error: updateError } = await supabase
        .from("access_keys")
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          user_id: authData.user.id,
        })
        .eq("id", keyData.id);

      if (updateError) throw updateError;

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      toast.success(`Hoş geldiniz ${keyData.customer_name}!`);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
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
              <Hotel className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">TŞDMR Hotel Management</CardTitle>
          <CardDescription>
            Erişim anahtarınızı girerek sisteme giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessKey">Erişim Anahtarı</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="accessKey"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Admin tarafından verilen erişim anahtarınızı girin
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}