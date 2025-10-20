import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Hotel, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("access_requests").insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        message: formData.message || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("İsteğiniz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        message: "",
      });
    } catch (error: any) {
      toast.error(error.message || "İstek gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-ocean">
              <Hotel className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TŞDMR Hotel Management</h1>
              <p className="text-xs text-muted-foreground">Bulut Tabanlı Otel Yönetim Sistemi</p>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")}>Giriş Yap</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Otel İşletmenizi Dijitalleştirin
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              TŞDMR Hotel Management ile rezervasyonlarınızı, misafirlerinizi, odalarınızı ve 
              faturalamalarınızı tek bir platformdan yönetin.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Rezervasyon Yönetimi",
                "Misafir Takibi",
                "Oda Yönetimi",
                "Faturalama ve Ödeme Takibi",
                "Kat Hizmetleri Koordinasyonu",
                "KBS Entegrasyonu",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Request Access Form */}
          <Card>
            <CardHeader>
              <CardTitle>Erişim Talebi</CardTitle>
              <CardDescription>
                Sistemi kullanmaya başlamak için aşağıdaki formu doldurun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad *</Label>
                  <Input
                    id="full_name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Şirket/Otel Adı</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Şirket veya otel adınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="İsteğiniz veya sorularınız..."
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Erişim Talebi Gönder"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}