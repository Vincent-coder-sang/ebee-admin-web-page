import { useEffect, useState } from "react";
import axios from "axios";
import { setHeaders, url } from "@/features/slices/api";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Download, Check, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/payment/history`, setHeaders());
      setPayments(res.data.data);
    } catch (error) {
      setError(error);
      toast.error(error.res.message.data, {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayments = async (paymentId, isApproved) => {
    try {
      const response = await axios.put(
        `${url}/payment/${paymentId}`,
        { isApproved },
        setHeaders()
      );

      console.log("payment response is", response.data);

      toast.success(response.data.message, {
        position: "top-center",
      });

      fetchPayments();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Payment approval failed";
      toast.error(errorMessage);
      console.log(errorMessage);
    }
  };

  //TODO: Implement receipt generation
  // This is a placeholder function. Actual implementation will depend on your backend setup.
  const handleGenerateReceipt = async (id) => {
    try {
      window.open(`${url}/payment/${id}/receipt`, "_blank");
    } catch (err) {
      console.error("Failed to generate receipt:", err);
      alert("Failed to generate receipt");
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMM yyyy, h:mm a");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredPayments = payments.filter((payment) => {
    // Filter by status
    if (filter !== "all" && payment.status !== filter) return false;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.reference?.toLowerCase().includes(searchLower) ||
        payment.phoneNumber?.toLowerCase().includes(searchLower) ||
        payment.mpesaReceiptNumber?.toLowerCase().includes(searchLower) ||
        payment.amount?.toString().includes(searchTerm)
      );
    }

    return true;
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Error Loading Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchPayments} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Payment History</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {payments.length} total payment
                {payments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Receipt No
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[120px] sm:max-w-none">
                          {payment.reference}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {payment.phoneNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {payment.mpesaReceiptNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "Paid"
                              ? "success"
                              : payment.status === "Failed"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {payment.status || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {payment.status === "Paid" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleGenerateReceipt(payment.id)
                                }
                                className="cursor-pointer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                            )}
                            {payment.isApproved === false && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApprovePayments(payment.id, true)
                                  }
                                  className="cursor-pointer text-green-600"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApprovePayments(payment.id, false)
                                  }
                                  className="cursor-pointer text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject Payment
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-gray-500">
                          {filter === "all"
                            ? "No payment records found"
                            : `No ${filter.toLowerCase()} payments found`}
                        </p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
