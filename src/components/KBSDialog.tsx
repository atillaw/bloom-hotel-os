import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KBSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestData: {
    first_name: string;
    last_name: string;
    id_number: string;
    nationality: string;
  };
  onVerified: () => void;
}

export const KBSDialog = ({ open, onOpenChange, guestData, onVerified }: KBSDialogProps) => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationData, setVerificationData] = useState({
    kbs_reference: "",
    verification_date: new Date().toISOString(),
  });

  const handleVerify = async () => {
    setVerifying(true);

    // Simulated KBS verification - in production, this would call actual KBS API
    setTimeout(() => {
      setVerified(true);
      setVerifying(false);
      toast.success("Kimlik doğrulaması başarılı!");
      
      // Auto-close and callback after verification
      setTimeout(() => {
        onVerified();
        onOpenChange(false);
      }, 1500);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            KBS Kimlik Doğrulama
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ad Soyad:</span>
              <span className="font-medium">{guestData.first_name} {guestData.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">TC/Pasaport No:</span>
              <span className="font-medium">{guestData.id_number || "Belirtilmemiş"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Uyruk:</span>
              <span className="font-medium">{guestData.nationality || "Belirtilmemiş"}</span>
            </div>
          </div>

          {!verified && !verifying && (
            <div className="space-y-2">
              <Label>KBS Referans No (Opsiyonel)</Label>
              <Input
                value={verificationData.kbs_reference}
                onChange={(e) => setVerificationData({ ...verificationData, kbs_reference: e.target.value })}
                placeholder="KBS referans numarası..."
              />
            </div>
          )}

          {verifying && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Kimlik doğrulanıyor...</span>
            </div>
          )}

          {verified && (
            <div className="flex items-center justify-center gap-2 py-8 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <div>
                <p className="font-semibold">Doğrulama Başarılı!</p>
                <p className="text-sm text-muted-foreground">Kimlik bilgileri onaylandı</p>
              </div>
            </div>
          )}

          {!guestData.id_number && !verified && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Uyarı</p>
                <p className="text-xs">TC Kimlik veya Pasaport numarası girilmemiş. Lütfen misafir bilgilerini güncelleyin.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={verifying}>
              {verified ? "Kapat" : "İptal"}
            </Button>
            {!verified && (
              <Button onClick={handleVerify} disabled={verifying || !guestData.id_number}>
                {verifying ? "Doğrulanıyor..." : "Kimlik Doğrula"}
              </Button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>KBS (Kimlik Bilgilendirme Sistemi):</strong> Misafir kimlik bilgilerini resmi sistemler ile doğrular. 
            Otel işletmelerinde yasal gereklilik olan bu süreç, güvenlik ve kayıt tutma standartlarına uygundur.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
