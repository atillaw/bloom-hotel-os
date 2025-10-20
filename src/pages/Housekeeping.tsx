import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Housekeeping = () => {
  const [taskDialog, setTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deletingTask, setDeletingTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_id: "",
    task_type: "",
    priority: "normal",
    assigned_to: "",
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: "",
    status: "pending",
  });

  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("room_number");
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks, refetch } = useQuery({
    queryKey: ["housekeeping-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
        .select("*, rooms(*)")
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        room_id: formData.room_id,
        task_type: formData.task_type,
        priority: formData.priority as "low" | "normal" | "high" | "urgent",
        assigned_to: formData.assigned_to || null,
        scheduled_date: formData.scheduled_date,
        notes: formData.notes || null,
        status: formData.status as "pending" | "in_progress" | "completed" | "cancelled",
      };

      let error;
      if (editingTask) {
        ({ error } = await supabase.from("housekeeping_tasks").update(taskData).eq("id", editingTask.id));
      } else {
        ({ error } = await supabase.from("housekeeping_tasks").insert(taskData));
      }

      if (error) throw error;

      toast.success(editingTask ? "Görev güncellendi!" : "Görev oluşturuldu!");
      refetch();
      setTaskDialog(false);
      setEditingTask(null);
      setFormData({
        room_id: "",
        task_type: "",
        priority: "normal",
        assigned_to: "",
        scheduled_date: new Date().toISOString().split('T')[0],
        notes: "",
        status: "pending",
      });
    } catch (error: any) {
      toast.error(error.message || "Görev kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      room_id: task.room_id,
      task_type: task.task_type,
      priority: task.priority,
      assigned_to: task.assigned_to || "",
      scheduled_date: task.scheduled_date,
      notes: task.notes || "",
      status: task.status,
    });
    setTaskDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingTask) return;

    try {
      const { error } = await supabase.from("housekeeping_tasks").delete().eq("id", deletingTask.id);
      if (error) throw error;

      toast.success("Görev silindi!");
      refetch();
      setDeletingTask(null);
    } catch (error: any) {
      toast.error(error.message || "Görev silinemedi");
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("housekeeping_tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Durum güncellendi!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Durum güncellenemedi");
    }
  };

  const pendingTasks = tasks?.filter(t => t.status === "pending").length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === "in_progress").length || 0;
  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Kat Hizmetleri Yönetimi</h2>
          <p className="text-muted-foreground">Temizlik ve bakım görevlerini takip edin</p>
        </div>
        <Button onClick={() => {
          setEditingTask(null);
          setTaskDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Görevler</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tasks?.map((task: any) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Oda {task.rooms?.room_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{task.task_type}</p>
                </div>
                <Badge
                  variant={
                    task.status === "completed" ? "default" :
                    task.status === "in_progress" ? "secondary" :
                    task.status === "cancelled" ? "destructive" : "outline"
                  }
                >
                  {task.status === "pending" ? "Beklemede" :
                   task.status === "in_progress" ? "Devam Ediyor" :
                   task.status === "completed" ? "Tamamlandı" : "İptal"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Öncelik:</span>
                  <Badge variant={
                    task.priority === "urgent" ? "destructive" :
                    task.priority === "high" ? "secondary" : "outline"
                  }>
                    {task.priority === "urgent" ? "Acil" :
                     task.priority === "high" ? "Yüksek" :
                     task.priority === "normal" ? "Normal" : "Düşük"}
                  </Badge>
                </div>
                {task.assigned_to && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atanan:</span>
                    <span>{task.assigned_to}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Planlanan Tarih:</span>
                  <span>{format(new Date(task.scheduled_date), "dd/MM/yyyy")}</span>
                </div>
                {task.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tamamlanma:</span>
                    <span>{format(new Date(task.completed_at), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                )}
                {task.notes && (
                  <div className="pt-2">
                    <p className="text-muted-foreground text-xs">{task.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {task.status !== "completed" && task.status !== "cancelled" && (
                  <>
                    {task.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(task.id, "in_progress")}
                      >
                        Başlat
                      </Button>
                    )}
                    {task.status === "in_progress" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(task.id, "completed")}
                      >
                        Tamamla
                      </Button>
                    )}
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(task)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeletingTask(task)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={taskDialog} onOpenChange={(open) => {
        setTaskDialog(open);
        if (!open) setEditingTask(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Görev Düzenle" : "Yeni Görev Oluştur"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Oda *</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Oda seçin" />
                </SelectTrigger>
                <SelectContent>
                  {rooms?.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Oda {room.room_number} - {room.room_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Görev Tipi *</Label>
              <Select value={formData.task_type} onValueChange={(value) => setFormData({ ...formData, task_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Görev tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genel Temizlik">Genel Temizlik</SelectItem>
                  <SelectItem value="Derin Temizlik">Derin Temizlik</SelectItem>
                  <SelectItem value="Çamaşır Değişimi">Çamaşır Değişimi</SelectItem>
                  <SelectItem value="Bakım/Onarım">Bakım/Onarım</SelectItem>
                  <SelectItem value="İnspeksiyon">İnspeksiyon</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Öncelik *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durum *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Atanan Kişi</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                placeholder="Personel adı..."
              />
            </div>

            <div className="space-y-2">
              <Label>Planlanan Tarih *</Label>
              <Input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notlar</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Görev detayları..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setTaskDialog(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : (editingTask ? "Güncelle" : "Oluştur")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görevi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Housekeeping;
