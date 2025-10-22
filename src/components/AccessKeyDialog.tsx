import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccessKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AccessKeyDialog = ({ open, onOpenChange, onSuccess }: AccessKeyDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    company_name: "",
    notes: "",
  });

  const generateAccessKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let key = "";
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) key += "-";
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessKey = generateAccessKey();
      
      const { error } = await supabase.from("access_keys").insert({
        access_key: accessKey,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        company_name: formData.company_name,
        notes: formData.notes,
      });

      if (error) throw error;

      toast.success(`Erişim anahtarı oluşturuldu: ${accessKey}`, { duration: 10000 });
      onSuccess();
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        company_name: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Erişim anahtarı oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Erişim Anahtarı Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Müşteri Adı *</Label>
            <Input
              id="customer_name"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Ad Soyad"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_email">E-posta</Label>
            <Input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              placeholder="musteri@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_phone">Telefon</Label>
            <Input
              id="customer_phone"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              placeholder="+90 555 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Şirket Adı</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Şirket Adı"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ek notlar..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Anahtar Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}