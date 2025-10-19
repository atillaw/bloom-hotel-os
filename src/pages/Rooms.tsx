import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BedDouble, Users, DollarSign, Edit } from "lucide-react";
import { useState } from "react";
import { RoomDialog } from "@/components/RoomDialog";

const Rooms = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const { data: rooms, refetch } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("room_number");
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-success/10 text-success hover:bg-success/20";
      case "occupied": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      case "cleaning": return "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20";
      case "maintenance": return "bg-muted text-muted-foreground hover:bg-muted/80";
      case "reserved": return "bg-primary/10 text-primary hover:bg-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "presidential": return "gradient-gold text-primary-foreground";
      case "suite": return "bg-primary text-primary-foreground";
      case "deluxe": return "bg-secondary/20 text-secondary-foreground";
      default: return "bg-muted text-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Room Management</h2>
          <p className="text-muted-foreground">Manage your hotel rooms and their availability</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="shadow-ocean">
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms?.map((room) => (
          <Card key={room.id} className="shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BedDouble className="w-5 h-5 text-primary" />
                    Room {room.room_number}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Floor {room.floor}</p>
                </div>
                <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${getRoomTypeColor(room.room_type)} capitalize font-medium`}>
                  {room.room_type}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  Max {room.max_occupancy} guests
                </span>
                <span className="flex items-center gap-2 font-semibold text-primary">
                  <DollarSign className="w-4 h-4" />
                  ${room.rate_per_night}/night
                </span>
              </div>

              {room.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
            <div className="px-6 pb-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEditingRoom(room);
                  setIsDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {(!rooms || rooms.length === 0) && (
        <Card className="p-12 text-center">
          <BedDouble className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No rooms yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first room</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </Card>
      )}

      <RoomDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingRoom(null);
        }} 
        onSuccess={() => {
          refetch();
          setEditingRoom(null);
        }}
        editingRoom={editingRoom}
      />
    </div>
  );
};

export default Rooms;
