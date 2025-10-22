import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Key, Shield } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-ocean">
              <Hotel className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TŞDMR</h1>
              <p className="text-xs text-muted-foreground">Hotel Management System</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              <Key className="w-4 h-4 mr-2" />
              Giriş Yap
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Profesyonel Otel Yönetim Sistemi
          </h2>
          <p className="text-xl text-muted-foreground">
            TŞDMR Hotel Management ile otellerin rezervasyon, misafir yönetimi, oda takibi ve 
            faturalama süreçlerini tek bir platformdan yönetin. Güvenli, hızlı ve kullanıcı dostu arayüz.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button size="lg" onClick={() => navigate("/auth")}>
              <Key className="w-5 h-5 mr-2" />
              Erişim Anahtarı ile Giriş
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Oda Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tüm odaların durumunu gerçek zamanlı takip edin, oda tiplerini yönetin ve 
                müsaitlik durumunu anlık olarak kontrol edin.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Güvenli Erişim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Erişim anahtarı sistemi ile sadece yetkili kullanıcıların platforma erişimini sağlayın.
                Her kullanıcı için özel anahtar oluşturabilirsiniz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Tam Kontrol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rezervasyonlar, misafirler, faturalama ve kat hizmetlerini tek bir yerden yönetin.
                Detaylı raporlama ve analiz özellikleri.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Nasıl Çalışır?</CardTitle>
            <CardDescription className="text-base">
              TŞDMR Hotel Management sistemine erişim için admin tarafından size bir erişim anahtarı verilecektir.
              Bu anahtar ile sisteme giriş yapabilir ve otel yönetimi süreçlerinizi dijital ortamda yönetebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">1. Erişim Anahtarı Alın</div>
                <p className="text-muted-foreground">Admin size özel bir erişim anahtarı oluşturacak</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">2. Sisteme Giriş Yapın</div>
                <p className="text-muted-foreground">Anahtarınızı kullanarak platforma erişin</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">3. Yönetmeye Başlayın</div>
                <p className="text-muted-foreground">Tüm otel süreçlerinizi dijital ortamda yönetin</p>
              </div>
            </div>
            <Button size="lg" onClick={() => navigate("/auth")} className="mt-6">
              <Key className="w-5 h-5 mr-2" />
              Erişim Anahtarı ile Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
