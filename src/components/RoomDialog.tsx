import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingRoom?: any;
}

export const RoomDialog = ({ open, onOpenChange, onSuccess, editingRoom }: RoomDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "single",
    floor: "",
    max_occupancy: "2",
    rate_per_night: "",
    amenities: "",
    status: "available",
    description: "",
  });

  useEffect(() => {
    if (editingRoom) {
      setFormData({
        room_number: editingRoom.room_number || "",
        room_type: editingRoom.room_type || "single",
        floor: editingRoom.floor?.toString() || "",
        max_occupancy: editingRoom.max_occupancy?.toString() || "2",
        rate_per_night: editingRoom.rate_per_night?.toString() || "",
        amenities: editingRoom.amenities?.join(", ") || "",
        status: editingRoom.status || "available",
        description: editingRoom.description || "",
      });
    } else {
      setFormData({
        room_number: "",
        room_type: "single",
        floor: "",
        max_occupancy: "2",
        rate_per_night: "",
        amenities: "",
        status: "available",
        description: "",
      });
    }
  }, [editingRoom, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const roomData = {
        room_number: formData.room_number,
        room_type: formData.room_type as "single" | "double" | "suite" | "deluxe" | "presidential",
        floor: parseInt(formData.floor),
        max_occupancy: parseInt(formData.max_occupancy),
        rate_per_night: parseFloat(formData.rate_per_night),
        amenities: amenitiesArray.length > 0 ? amenitiesArray : null,
        status: formData.status as "available" | "occupied" | "cleaning" | "maintenance" | "reserved",
        description: formData.description || null,
      };

      let error;
      if (editingRoom) {
        ({ error } = await supabase.from("rooms").update(roomData).eq("id", editingRoom.id));
      } else {
        ({ error } = await supabase.from("rooms").insert(roomData));
      }

      if (error) throw error;

      toast.success(editingRoom ? "Oda güncellendi!" : "Oda eklendi!");
      onSuccess();
      onOpenChange(false);
      setFormData({
        room_number: "",
        room_type: "single",
        floor: "",
        max_occupancy: "2",
        rate_per_night: "",
        amenities: "",
        status: "available",
        description: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Oda kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRoom ? "Oda Düzenle" : "Yeni Oda Ekle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">Oda Numarası *</Label>
              <Input
                id="room_number"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                placeholder="101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Kat *</Label>
              <Input
                id="floor"
                type="number"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_type">Oda Tipi *</Label>
              <Select
                value={formData.room_type}
                onValueChange={(value) => setFormData({ ...formData, room_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Tek Kişilik</SelectItem>
                  <SelectItem value="double">Çift Kişilik</SelectItem>
                  <SelectItem value="suite">Suit</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Durum *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Müsait</SelectItem>
                  <SelectItem value="occupied">Dolu</SelectItem>
                  <SelectItem value="cleaning">Temizlikte</SelectItem>
                  <SelectItem value="maintenance">Bakımda</SelectItem>
                  <SelectItem value="reserved">Rezerve</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_occupancy">Maksimum Kapasite *</Label>
              <Input
                id="max_occupancy"
                type="number"
                required
                min="1"
                value={formData.max_occupancy}
                onChange={(e) => setFormData({ ...formData, max_occupancy: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_per_night">Gecelik Ücret (₺) *</Label>
              <Input
                id="rate_per_night"
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.rate_per_night}
                onChange={(e) => setFormData({ ...formData, rate_per_night: e.target.value })}
                placeholder="3500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Olanaklar (virgülle ayırın)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="WiFi, TV, Klima, Mini Bar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Oda açıklaması..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : (editingRoom ? "Güncelle" : "Ekle")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
