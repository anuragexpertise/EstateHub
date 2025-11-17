import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions, users } from "@/lib/data";
import { ArrowRightLeft, Building2, Shield, Users, Wrench } from "lucide-react";

const kpiData = [
    { title: "Total Residents", value: users.filter(u => u.role === 'Apartment').length, icon: Building2 },
    { title: "Total Contractors", value: users.filter(u => u.role === 'Contractor').length, icon: Wrench },
    { title: "Security Staff", value: users.filter(u => u.role === 'Security').length, icon: Shield },
    { title: "Total Users", value: users.length, icon: Users },
]

export function AdminDashboard() {
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">managed in the system</p>
              </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>A log of the most recent financial activities across the estate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.user}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.method}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {transaction.date.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
