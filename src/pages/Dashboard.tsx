import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/StatCard";
import { BedDouble, Users, Calendar, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: guests } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: reservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("*");
      if (error) throw error;
      return data;
    },
  });

  const availableRooms = rooms?.filter((r) => r.status === "available").length || 0;
  const occupiedRooms = rooms?.filter((r) => r.status === "occupied").length || 0;
  const totalRooms = rooms?.length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const activeReservations = reservations?.filter((r) => r.status === "confirmed" || r.status === "checked_in").length || 0;
  const totalRevenue = reservations?.reduce((sum, r) => sum + parseFloat(String(r.total_amount || 0)), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Rooms"
          value={totalRooms}
          icon={BedDouble}
          trend={`${availableRooms} available`}
          trendUp={availableRooms > 0}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={TrendingUp}
          trend={`${occupiedRooms}/${totalRooms} occupied`}
          trendUp={occupancyRate > 70}
        />
        <StatCard
          title="Active Guests"
          value={guests?.length || 0}
          icon={Users}
          trend="Total registered"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={`${activeReservations} active bookings`}
          trendUp={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations && reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Reservation #{reservation.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reservation.check_in_date).toLocaleDateString()} - {new Date(reservation.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.status === "confirmed" ? "bg-success/10 text-success" :
                      reservation.status === "pending" ? "bg-secondary/10 text-secondary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No reservations yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Room Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rooms && rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.slice(0, 5).map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Room {room.room_number}</p>
                      <p className="text-sm text-muted-foreground capitalize">{room.room_type} • Floor {room.floor}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      room.status === "available" ? "bg-success/10 text-success" :
                      room.status === "occupied" ? "bg-destructive/10 text-destructive" :
                      room.status === "cleaning" ? "bg-secondary/10 text-secondary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {room.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No rooms configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
