import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const GuestDialog = ({ open, onOpenChange, onSuccess }: GuestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nationality: "",
    id_number: "",
    preferences: "",
    loyalty_points: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("guests").insert({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || null,
        phone: formData.phone || null,
        nationality: formData.nationality || null,
        id_number: formData.id_number || null,
        preferences: formData.preferences || null,
        loyalty_points: parseInt(formData.loyalty_points) || 0,
      });

      if (error) throw error;

      toast.success("Misafir eklendi!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        nationality: "",
        id_number: "",
        preferences: "",
        loyalty_points: "0",
      });
    } catch (error: any) {
      toast.error(error.message || "Misafir eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Misafir Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Ad *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Soyad *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="misafir@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+90-555-0100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationality">Milliyet</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="Türkiye"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_number">Kimlik/Pasaport No</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                placeholder="Kimlik veya pasaport numarası"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loyalty_points">Başlangıç Sadakat Puanı</Label>
            <Input
              id="loyalty_points"
              type="number"
              min="0"
              value={formData.loyalty_points}
              onChange={(e) => setFormData({ ...formData, loyalty_points: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Tercihler</Label>
            <Textarea
              id="preferences"
              value={formData.preferences}
              onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
              placeholder="Misafir tercihleri ve özel istekler..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ekleniyor..." : "Misafir Ekle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
