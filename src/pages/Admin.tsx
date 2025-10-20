import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";
import { AddUserDialog } from "@/components/AddUserDialog";

export default function Admin() {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const { data: accessRequests, refetch } = useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("access_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`İstek ${status === "approved" ? "onaylandı" : "reddedildi"}`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Paneli</h1>
        <Button onClick={() => setAddUserDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Sistemdeki Kullanıcılar ({userRoles?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userRoles?.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">User ID: {role.user_id}</p>
                  <p className="text-sm text-muted-foreground">
                    Rol: <Badge variant={role.role === "admin" ? "default" : "secondary"}>
                      {role.role === "admin" ? "Admin" : "Müşteri"}
                    </Badge>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(role.created_at).toLocaleDateString("tr-TR")}
                </p>
              </div>
            ))}
            {(!userRoles || userRoles.length === 0) && (
              <p className="text-center text-muted-foreground py-8">Henüz kullanıcı yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Access Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Erişim Talepleri ({accessRequests?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessRequests?.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{request.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    {request.phone && (
                      <p className="text-sm text-muted-foreground">{request.phone}</p>
                    )}
                    {request.company_name && (
                      <p className="text-sm font-medium">{request.company_name}</p>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.message && (
                  <p className="text-sm bg-muted p-3 rounded">{request.message}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleString("tr-TR")}
                  </p>
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequestStatus(request.id, "rejected")}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reddet
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRequestStatus(request.id, "approved")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Onayla
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!accessRequests || accessRequests.length === 0) && (
              <p className="text-center text-muted-foreground py-8">Henüz talep yok</p>
            )}
          </div>
        </CardContent>
      </Card>

      <AddUserDialog 
        open={addUserDialogOpen} 
        onOpenChange={setAddUserDialogOpen}
        onSuccess={() => {
          setAddUserDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}