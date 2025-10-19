import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingReservation?: any;
}

export const ReservationDialog = ({ open, onOpenChange, onSuccess, editingReservation }: ReservationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guest_id: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
    number_of_guests: "1",
    special_requests: "",
    status: "pending",
  });

  useEffect(() => {
    if (editingReservation) {
      setFormData({
        guest_id: editingReservation.guest_id || "",
        room_id: editingReservation.room_id || "",
        check_in_date: editingReservation.check_in_date || "",
        check_out_date: editingReservation.check_out_date || "",
        number_of_guests: editingReservation.number_of_guests?.toString() || "1",
        special_requests: editingReservation.special_requests || "",
        status: editingReservation.status || "pending",
      });
    } else {
      setFormData({
        guest_id: "",
        room_id: "",
        check_in_date: "",
        check_out_date: "",
        number_of_guests: "1",
        special_requests: "",
        status: "pending",
      });
    }
  }, [editingReservation, open]);

  const { data: guests } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: rooms } = useQuery({
    queryKey: ["available-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .in("status", ["available", "reserved"]);
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const checkInDate = new Date(formData.check_in_date);
      const checkOutDate = new Date(formData.check_out_date);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const selectedRoom = rooms?.find((r) => r.id === formData.room_id);
      if (!selectedRoom) throw new Error("Room not found");

      const totalAmount = parseFloat(String(selectedRoom.rate_per_night)) * nights;

      const reservationData = {
        guest_id: formData.guest_id,
        room_id: formData.room_id,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        number_of_guests: parseInt(formData.number_of_guests),
        total_amount: totalAmount,
        special_requests: formData.special_requests || null,
        status: formData.status as "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show",
      };

      let error;
      if (editingReservation) {
        ({ error } = await supabase.from("reservations").update(reservationData).eq("id", editingReservation.id));
      } else {
        ({ error } = await supabase.from("reservations").insert(reservationData));
      }

      if (error) throw error;

      toast.success(editingReservation ? "Rezervasyon güncellendi!" : "Rezervasyon oluşturuldu!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        guest_id: "",
        room_id: "",
        check_in_date: "",
        check_out_date: "",
        number_of_guests: "1",
        special_requests: "",
        status: "pending",
      });
    } catch (error: any) {
      toast.error(error.message || "Rezervasyon kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingReservation ? "Rezervasyon Düzenle" : "Yeni Rezervasyon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest_id">Misafir *</Label>
              <Select required value={formData.guest_id} onValueChange={(value) => setFormData({ ...formData, guest_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Misafir seçin" />
                </SelectTrigger>
                <SelectContent>
                  {guests?.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room_id">Oda *</Label>
              <Select required value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Oda seçin" />
                </SelectTrigger>
                <SelectContent>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Oda {room.room_number} - {room.room_type} (₺{(parseFloat(String(room.rate_per_night)) * 35).toFixed(0)}/gece)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in_date">Giriş Tarihi *</Label>
              <Input
                id="check_in_date"
                type="date"
                required
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out_date">Çıkış Tarihi *</Label>
              <Input
                id="check_out_date"
                type="date"
                required
                value={formData.check_out_date}
                onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number_of_guests">Misafir Sayısı *</Label>
              <Input
                id="number_of_guests"
                type="number"
                min="1"
                required
                value={formData.number_of_guests}
                onChange={(e) => setFormData({ ...formData, number_of_guests: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Durum *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="confirmed">Onaylandı</SelectItem>
                  <SelectItem value="checked_in">Check-in Yapıldı</SelectItem>
                  <SelectItem value="checked_out">Check-out Yapıldı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests">Özel İstekler</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              placeholder="Özel istek veya notlar..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : (editingReservation ? "Güncelle" : "Oluştur")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
