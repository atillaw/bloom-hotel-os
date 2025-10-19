import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, BedDouble, Clock } from "lucide-react";
import { useState } from "react";
import { ReservationDialog } from "@/components/ReservationDialog";
import { format } from "date-fns";

const Reservations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: reservations, refetch } = useQuery({
    queryKey: ["reservations-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          guests (*),
          rooms (*)
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
          <h2 className="text-3xl font-bold">Reservation Management</h2>
          <p className="text-muted-foreground">Manage bookings and reservations</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="shadow-ocean">
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
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
                      {reservation.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {format(new Date(reservation.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ${reservation.total_amount}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Guest</p>
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
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">
                      {format(new Date(reservation.check_in_date), "MMM dd")} - {format(new Date(reservation.check_out_date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.number_of_guests} guest(s)
                    </p>
                  </div>
                </div>
              </div>

              {reservation.special_requests && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
                  <p className="text-sm">{reservation.special_requests}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!reservations || reservations.length === 0) && (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No reservations yet</h3>
          <p className="text-muted-foreground mb-4">Start by creating your first reservation</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Reservation
          </Button>
        </Card>
      )}

      <ReservationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={refetch} />
    </div>
  );
};

export default Reservations;
