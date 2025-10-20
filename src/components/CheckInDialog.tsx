import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { KBSDialog } from "./KBSDialog";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  reservation: any;
}

export const CheckInDialog = ({ open, onOpenChange, onSuccess, reservation }: CheckInDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [kbsDialogOpen, setKbsDialogOpen] = useState(false);
  const [kbsVerified, setKbsVerified] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: "credit_card",
    slip_code: "",
    amount: reservation?.total_amount?.toString() || "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kbsVerified) {
      toast.error("Lütfen önce KBS kimlik doğrulaması yapın!");
      setKbsDialogOpen(true);
      return;
    }

    setLoading(true);

    try {
      // Update reservation status to checked_in
      const { error: reservationError } = await supabase
        .from("reservations")
        .update({ status: "checked_in" })
        .eq("id", reservation.id);

      if (reservationError) throw reservationError;

      // Update room status to occupied
      const { error: roomError } = await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", reservation.room_id);

      if (roomError) throw roomError;

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        reservation_id: reservation.id,
        payment_method: formData.payment_method as "credit_card" | "cash" | "debit_card" | "bank_transfer" | "other",
        amount: parseFloat(formData.amount),
        slip_code: formData.payment_method === "credit_card" ? formData.slip_code : null,
        notes: formData.notes || null,
      });

      if (paymentError) throw paymentError;

      toast.success("Check-in başarılı! Ödeme kaydedildi.");
      setKbsVerified(false);
      onSuccess();
      onOpenChange(false);
      setFormData({
        payment_method: "credit_card",
        slip_code: "",
        amount: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Check-in işlemi başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleKBSVerified = () => {
    setKbsVerified(true);
    toast.success("KBS doğrulaması tamamlandı!");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in & Ödeme Bilgileri</DialogTitle>
          </DialogHeader>

          <div className="mb-4">
            <Button
              type="button"
              variant={kbsVerified ? "default" : "outline"}
              className="w-full"
              onClick={() => setKbsDialogOpen(true)}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {kbsVerified ? "KBS Doğrulandı ✓" : "KBS Kimlik Doğrula"}
            </Button>
            {!kbsVerified && (
              <p className="text-xs text-muted-foreground mt-2">
                Check-in yapmadan önce KBS kimlik doğrulaması gereklidir
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-1">Misafir</p>
              <p className="text-lg font-semibold">
                {reservation?.guests?.first_name} {reservation?.guests?.last_name}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Oda {reservation?.rooms?.room_number}
              </p>
              <p className="text-xl font-bold text-primary mt-2">
                Toplam: ₺{(parseFloat(String(reservation?.total_amount || 0)) * 35).toFixed(0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Yöntemi *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="cash">Nakit</SelectItem>
                  <SelectItem value="debit_card">Banka Kartı</SelectItem>
                  <SelectItem value="bank_transfer">Banka Transferi</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.payment_method === "credit_card" && (
              <div className="space-y-2">
                <Label htmlFor="slip_code">Slip/İşlem Kodu *</Label>
                <Input
                  id="slip_code"
                  required
                  value={formData.slip_code}
                  onChange={(e) => setFormData({ ...formData, slip_code: e.target.value })}
                  placeholder="Kredi kartı slip kodu"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Ödenen Tutar (₺) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ödeme ile ilgili notlar..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Check-in Yap"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {reservation?.guests && (
        <KBSDialog
          open={kbsDialogOpen}
          onOpenChange={setKbsDialogOpen}
          guestData={{
            first_name: reservation.guests.first_name,
            last_name: reservation.guests.last_name,
            id_number: reservation.guests.id_number || "",
            nationality: reservation.guests.nationality || "",
          }}
          onVerified={handleKBSVerified}
        />
      )}
    </>
  );
};
