import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, BedDouble, Clock, LogIn, CreditCard, Edit, X } from "lucide-react";
import { useState } from "react";
import { ReservationDialog } from "@/components/ReservationDialog";
import { CheckInDialog } from "@/components/CheckInDialog";
import { CancelReservationDialog } from "@/components/CancelReservationDialog";
import { format } from "date-fns";

const Reservations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [checkInReservation, setCheckInReservation] = useState<any>(null);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [cancelReservation, setCancelReservation] = useState<any>(null);

  const { data: reservations, refetch } = useQuery({
    queryKey: ["reservations-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          guests (*),
          rooms (*),
          payments (*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-success/10 text-success";
      case "checked_in": return "bg-primary/10 text-primary";
      case "checked_out": return "bg-muted text-muted-foreground";
      case "pending": return "bg-secondary/10 text-secondary-foreground";
      case "cancelled": return "bg-destructive/10 text-destructive";
      case "no_show": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Rezervasyon Yönetimi</h2>
          <p className="text-muted-foreground">Rezervasyonları yönetin</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="shadow-ocean">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Rezervasyon
        </Button>
      </div>

      <div className="grid gap-4">
        {reservations?.map((reservation) => (
          <Card key={reservation.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      Reservation #{reservation.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status === "pending" ? "Beklemede" :
                       reservation.status === "confirmed" ? "Onaylandı" :
                       reservation.status === "checked_in" ? "Check-in" :
                       reservation.status === "checked_out" ? "Check-out" :
                       reservation.status === "cancelled" ? "İptal" : "Gelmedi"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ₺{(parseFloat(String(reservation.total_amount)) * 35).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Toplam Tutar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Misafir</p>
                    <p className="font-medium">
                      {reservation.guests?.first_name} {reservation.guests?.last_name}
                    </p>
                    {reservation.guests?.email && (
                      <p className="text-sm text-muted-foreground">{reservation.guests.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <BedDouble className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Room</p>
                    <p className="font-medium">Room {reservation.rooms?.room_number}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {reservation.rooms?.room_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Süre</p>
                    <p className="font-medium">
                      {format(new Date(reservation.check_in_date), "dd MMM")} - {format(new Date(reservation.check_out_date), "dd MMM yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.number_of_guests} misafir
                    </p>
                  </div>
                </div>
              </div>

              {reservation.special_requests && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <p className="text-xs text-muted-foreground mb-1">Özel İstekler</p>
                  <p className="text-sm">{reservation.special_requests}</p>
                </div>
              )}

              {reservation.payments && reservation.payments.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-success" />
                    <p className="font-semibold text-success">Ödeme Bilgileri</p>
                  </div>
                  {reservation.payments.map((payment: any) => (
                    <div key={payment.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Yöntem:</span>
                        <span className="font-medium capitalize">
                          {payment.payment_method === "credit_card" ? "Kredi Kartı" :
                           payment.payment_method === "cash" ? "Nakit" :
                           payment.payment_method === "debit_card" ? "Banka Kartı" :
                           payment.payment_method === "bank_transfer" ? "Banka Transferi" :
                           "Diğer"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tutar:</span>
                        <span className="font-semibold text-success">${payment.amount}</span>
                      </div>
                      {payment.slip_code && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Slip Kodu:</span>
                          <span className="font-mono text-sm">{payment.slip_code}</span>
                        </div>
                      )}
                      {payment.notes && (
                        <div className="mt-2 pt-2 border-t border-success/20">
                          <p className="text-xs text-muted-foreground mb-1">Notlar:</p>
                          <p className="text-sm">{payment.notes}</p>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(payment.payment_date), "dd MMM yyyy HH:mm")}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(reservation.status === "confirmed" || reservation.status === "pending") && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingReservation(reservation)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCancelReservation(reservation)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                </div>
              )}

              {(reservation.status === "confirmed" || reservation.status === "pending") && (
                <div className="mt-3">
                  <Button
                    className="w-full"
                    onClick={() => setCheckInReservation(reservation)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Check-in Yap
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!reservations || reservations.length === 0) && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Henüz rezervasyon yok</h3>
          <p className="text-muted-foreground mb-4">İlk rezervasyonunuzu oluşturun</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Rezervasyon
          </Button>
        </Card>
      )}

      <ReservationDialog 
        open={isDialogOpen || !!editingReservation} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingReservation(null);
        }}
        onSuccess={refetch}
        editingReservation={editingReservation}
      />
      <CheckInDialog
        open={!!checkInReservation}
        onOpenChange={(open) => !open && setCheckInReservation(null)}
        onSuccess={refetch}
        reservation={checkInReservation}
      />
      <CancelReservationDialog
        open={!!cancelReservation}
        onOpenChange={(open) => !open && setCancelReservation(null)}
        onSuccess={refetch}
        reservation={cancelReservation}
      />
    </div>
  );
};

export default Reservations;
