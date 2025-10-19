import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Mail, Phone, Award } from "lucide-react";
import { useState } from "react";
import { GuestDialog } from "@/components/GuestDialog";

const Guests = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: guests, refetch } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Guest Management</h2>
          <p className="text-muted-foreground">Manage guest profiles and history</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="shadow-ocean">
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
      </div>

      <div className="grid gap-4">
        {guests?.map((guest) => (
          <Card key={guest.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {guest.first_name} {guest.last_name}
                      </h3>
                      {guest.nationality && (
                        <Badge variant="outline" className="mt-1">
                          {guest.nationality}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {guest.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                    </div>

                    {guest.preferences && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Preferences:</span> {guest.preferences}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10">
                  <Award className="w-5 h-5 text-secondary-foreground" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Loyalty Points</p>
                    <p className="text-lg font-bold text-secondary-foreground">{guest.loyalty_points || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!guests || guests.length === 0) && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No guests yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first guest</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </Card>
      )}

      <GuestDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={refetch} />
    </div>
  );
};

export default Guests;
