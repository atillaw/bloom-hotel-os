import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Billing = () => {
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const { data: payments, refetch: refetchPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, reservations(*, guests(*), rooms(*))")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ["cash-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("cash_transactions").insert({
        type: formData.type as "income" | "expense",
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || null,
        transaction_date: formData.date,
      });

      if (error) throw error;

      toast.success("İşlem kaydedildi!");
      refetchTransactions();
      setTransactionDialog(false);
      setFormData({
        type: "income",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      toast.error(error.message || "İşlem kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  const totalPayments = payments?.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0) || 0;
  const totalIncome = transactions?.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;
  const totalExpense = transactions?.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(String(t.amount)), 0) || 0;
  const netIncome = totalPayments + totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Faturalama & Muhasebe</h2>
        <p className="text-muted-foreground">Ödemeleri ve nakit akışını yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rezervasyon Geliri</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Diğer Gelirler</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Giderler</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{netIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rezervasyon Ödemeleri</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Misafir</TableHead>
                  <TableHead>Oda</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Yöntem</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.slice(0, 10).map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.reservations?.guests?.first_name} {payment.reservations?.guests?.last_name}
                    </TableCell>
                    <TableCell>Oda {payment.reservations?.rooms?.room_number}</TableCell>
                    <TableCell className="font-semibold">₺{parseFloat(String(payment.amount)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.payment_method === "credit_card" ? "Kredi Kartı" :
                         payment.payment_method === "cash" ? "Nakit" :
                         payment.payment_method === "debit_card" ? "Banka Kartı" :
                         payment.payment_method === "bank_transfer" ? "Havale" : "Diğer"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(payment.payment_date), "dd/MM/yyyy HH:mm")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nakit Giriş/Çıkış</CardTitle>
            <Button size="sm" onClick={() => setTransactionDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              İşlem Ekle
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tip</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.slice(0, 10).map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                        {transaction.type === "income" ? "Gelir" : "Gider"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}₺{parseFloat(String(transaction.amount)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{format(new Date(transaction.transaction_date), "dd/MM/yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={transactionDialog} onOpenChange={setTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nakit Giriş/Çıkış Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>İşlem Tipi *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Input
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Örn: Elektrik, Su, Personel Maaşı, Ekstra Hizmet"
              />
            </div>

            <div className="space-y-2">
              <Label>Tutar (₺) *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Tarih *</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="İşlem detayları..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setTransactionDialog(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
