/* eslint-disable no-unused-vars */
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
import {
  MoreVertical,
  Download,
  Check,
  X,
  RefreshCw,
  Search,
  Filter,
  Smartphone,
  CreditCard,
  Calendar,
  FileText,
  DownloadIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PropTypes from 'prop-types'; // Add this import

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/payment/history`, setHeaders());
      setPayments(res.data.data);
    } catch (error) {
      setError(error.message || "Failed to fetch payments");
      toast.error(error.response?.data?.message || "Failed to load payments", {
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

      toast.success(response.data.message, {
        position: "top-center",
      });

      fetchPayments();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Payment approval failed";
      toast.error(errorMessage);
      console.error("Payment approval error:", errorMessage);
    }
  };

  const handleGenerateReceipt = async (id) => {
    try {
      window.open(`${url}/payment/${id}/receipt`, "_blank");
    } catch (err) {
      console.error("Failed to generate receipt:", err);
      toast.error("Failed to generate receipt");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, h:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM, h:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0);
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

  // Define PaymentCardMobile component before using it
  const PaymentCardMobile = ({ payment }) => {
    const handleViewDetails = () => {
      setSelectedPayment(payment);
    };

    return (
      <Card className="mb-3">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  {payment.reference}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      payment.status === "Paid"
                        ? "success"
                        : payment.status === "Failed"
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize text-xs"
                  >
                    {payment.status || "Pending"}
                  </Badge>
                  {payment.isApproved === false && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                      Awaiting Approval
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {payment.status === "Paid" && (
                    <DropdownMenuItem
                      onClick={() => handleGenerateReceipt(payment.id)}
                      className="cursor-pointer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </DropdownMenuItem>
                  )}
                  {payment.isApproved === false && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleApprovePayments(payment.id, true)}
                        className="cursor-pointer text-green-600"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleApprovePayments(payment.id, false)}
                        className="cursor-pointer text-red-600"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Payment
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-medium">{formatCurrency(payment.amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{payment.phoneNumber || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Receipt No</p>
                <p className="font-medium">{payment.mpesaReceiptNumber || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{formatDateShort(payment.createdAt)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleViewDetails}
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Details
              </Button>
              {payment.isApproved === false && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleApprovePayments(payment.id, true)}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Approve
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add PropTypes validation for PaymentCardMobile
  PaymentCardMobile.propTypes = {
    payment: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      reference: PropTypes.string,
      status: PropTypes.string,
      isApproved: PropTypes.bool,
      amount: PropTypes.number,
      phoneNumber: PropTypes.string,
      mpesaReceiptNumber: PropTypes.string,
      createdAt: PropTypes.string,
    }).isRequired,
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 sm:p-4 border rounded-lg"
              >
                <div className="space-y-1.5 sm:space-y-2">
                  <Skeleton className="h-4 w-32 sm:w-40" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                </div>
                <Skeleton className="h-8 w-20 sm:w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Error Loading Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600 text-sm sm:text-base">{error}</p>
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
    <div className="p-3 sm:p-4 md:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Payment History</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPayments.length} of {payments.length} payment
              {payments.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Search and Filter - Mobile */}
          <div className="block sm:hidden space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <SheetHeader>
                    <SheetTitle className="text-lg">Filter Payments</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchPayments}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filter - Desktop */}
          <div className="hidden sm:flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments by reference, phone, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={fetchPayments}
                className="gap-2 h-10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total</p>
                  <p className="text-lg sm:text-xl font-bold">{payments.length}</p>
                </div>
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Paid</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {payments.filter(p => p.status === 'Paid').length}
                  </p>
                </div>
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pending</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {payments.filter(p => p.status === 'Pending').length}
                  </p>
                </div>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Failed</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {payments.filter(p => p.status === 'Failed').length}
                  </p>
                </div>
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Payment Cards */}
        <div className="block sm:hidden">
          {filteredPayments.length > 0 ? (
            <div>
              {filteredPayments.map((payment) => (
                <PaymentCardMobile key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm || filter !== "all"
                    ? "No payments match your search"
                    : "No payment records found"}
                </p>
                {(searchTerm || filter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                    className="mt-3"
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop Payments Table */}
        <div className="hidden sm:block">
          <Card>
            <CardHeader className="border-b p-4">
              <CardTitle className="text-lg">Payment Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px] text-xs sm:text-sm">Reference</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                      <TableHead className="text-xs sm:text-sm">Receipt No</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div className="truncate max-w-[140px]">{payment.reference}</div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {payment.phoneNumber || "N/A"}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
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
                              className="capitalize text-xs"
                            >
                              {payment.status || "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {formatDate(payment.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {payment.status === "Paid" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleGenerateReceipt(payment.id)}
                                  title="Download Receipt"
                                  className="h-8 w-8"
                                >
                                  <DownloadIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  {payment.status === "Paid" && (
                                    <DropdownMenuItem
                                      onClick={() => handleGenerateReceipt(payment.id)}
                                      className="cursor-pointer"
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Receipt
                                    </DropdownMenuItem>
                                  )}
                                  {payment.isApproved === false && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleApprovePayments(payment.id, true)}
                                        className="cursor-pointer text-green-600"
                                      >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve Payment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleApprovePayments(payment.id, false)}
                                        className="cursor-pointer text-red-600"
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject Payment
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <CreditCard className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-500">
                              {filter === "all"
                                ? "No payment records found"
                                : `No ${filter.toLowerCase()} payments found`}
                            </p>
                            {(searchTerm || filter !== "all") && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSearchTerm("");
                                  setFilter("all");
                                }}
                              >
                                Clear filters
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

        {/* Payment Details Dialog */}
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="sm:max-w-md max-w-[95vw]">
            {selectedPayment && (
              <>
                <DialogHeader>
                  <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Reference</p>
                      <p className="font-medium">{selectedPayment.reference}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge
                        variant={
                          selectedPayment.status === "Paid"
                            ? "success"
                            : selectedPayment.status === "Failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {selectedPayment.status || "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{selectedPayment.phoneNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Receipt No</p>
                      <p className="font-medium">{selectedPayment.mpesaReceiptNumber || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-2">
                    {selectedPayment.status === "Paid" && (
                      <Button
                        onClick={() => handleGenerateReceipt(selectedPayment.id)}
                        className="flex-1 gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Receipt
                      </Button>
                    )}
                    {selectedPayment.isApproved === false && (
                      <Button
                        onClick={() => {
                          handleApprovePayments(selectedPayment.id, true);
                          setSelectedPayment(null);
                        }}
                        className="flex-1 gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPayments;