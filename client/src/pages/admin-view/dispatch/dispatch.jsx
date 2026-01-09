/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDispatches } from "@/features/slices/dispatchSlice";

const AdminDispatch = () => {
  const dispatch = useDispatch();

  const { list: dispatchList, status } = useSelector((state) => state.dispatches);

  useEffect(() => {
    dispatch(getDispatches());
  }, [dispatch]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Dispatch Records</h2>

      {status === "pending" && <p>Loading dispatches...</p>}

      {status === "success" && dispatchList.length === 0 && <p>No dispatches found.</p>}

      {status === "success" && dispatchList.length > 0 && (
        <ul className="space-y-3">
          {dispatchList.map((dispatch) => (
            <li key={dispatch.id} className="border rounded p-4 shadow-sm">
              <p><strong>Order ID:</strong> {dispatch.order?.id}</p>
              <p><strong>Order Status:</strong> {dispatch.order?.orderStatus}</p>
              <p><strong>Driver:</strong> {dispatch.driver?.name}</p>
              <p><strong>Delivery Date:</strong> {dispatch.deliveryDate}</p>
              <p><strong>Status:</strong> {dispatch.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDispatch;
