import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface CancelReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  reservation: any;
}

export const CancelReservationDialog = ({ open, onOpenChange, onSuccess, reservation }: CancelReservationDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);

    try {
      // Update reservation status to cancelled
      const { error: reservationError } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservation.id);

      if (reservationError) throw reservationError;

      // Update room status back to available
      const { error: roomError } = await supabase
        .from("rooms")
        .update({ status: "available" })
        .eq("id", reservation.room_id);

      if (roomError) throw roomError;

      toast.success("Rezervasyon iptal edildi");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Rezervasyon iptal edilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Rezervasyon İptal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="font-medium mb-2">Bu rezervasyonu iptal etmek istediğinizden emin misiniz?</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Misafir:</span> {reservation?.guests?.first_name} {reservation?.guests?.last_name}</p>
              <p><span className="font-medium">Oda:</span> {reservation?.rooms?.room_number}</p>
              <p><span className="font-medium">Tutar:</span> ₺{(parseFloat(String(reservation?.total_amount || 0)) * 35).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? "İptal Ediliyor..." : "Rezervasyonu İptal Et"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
