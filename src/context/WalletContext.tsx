"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "../context/UserContext";

// ✅ Types
export interface Wallet {
  id: string;
  total_amount: number;
  unutilized_amount: number;
  bonus_amount: number;
  currency: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  description?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface DepositOrderResponse {
  amount: number;
  currency: string;
  order_id: string;
  payment_id?: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  loading: boolean;
  fetchWallet: () => Promise<void>;
  fetchTransactions: (
    limit?: number,
    offset?: number,
    transactionType?: string | null
  ) => Promise<{ transactions: Transaction[]; total: number }>;
  fetchWithdrawals: () => Promise<void>;
  createDepositOrder: (amount: number) => Promise<any>;
  verifyDeposit: (
    paymentId: string,
    verificationData: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  createWithdrawal: (withdrawalData: any) => Promise<any>;
  initiatePayment: (
    amount: number,
    onSuccess?: (data: any) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  getTransactionTypeColor: (type: string) => string;
  getTransactionIcon: (type: string) => string;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// ✅ Environment Config
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8100";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
}) => {
  const { user } = useUser();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Wallet
  const fetchWallet = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setWallet(data);
    } catch (err) {
      console.error("fetchWallet error:", err);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Transactions
  const fetchTransactions = async (
    limit = 50,
    offset = 0,
    transactionType: string | null = null
  ) => {
    if (!user) return { transactions: [], total: 0 };
    try {
      const token = localStorage.getItem("userToken");
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (transactionType) params.append("type", transactionType);

      const response = await fetch(
        `${API_BASE_URL}/api/wallet/transactions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
      return data;
    } catch (err) {
      console.error("fetchTransactions error:", err);
      setTransactions([]);
      return { transactions: [], total: 0 };
    }
  };

  // ✅ Fetch Withdrawals
  const fetchWithdrawals = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/withdrawals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setWithdrawals(data);
    } catch (err) {
      console.error("fetchWithdrawals error:", err);
      setWithdrawals([]);
    }
  };

  // ✅ Create Deposit Order
  const createDepositOrder = async (amount: number) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `${API_BASE_URL}/api/wallet/deposit/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );
      const data = await response.json();
      return response.ok
        ? { success: true, data }
        : { success: false, error: data.detail || "Failed to create deposit order" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // ✅ Verify Deposit
  const verifyDeposit = async (paymentId: string, verificationData: any) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/deposit/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_id: paymentId, ...verificationData }),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchWallet();
        await fetchTransactions();
        return { success: true, data };
      }
      return { success: false, error: data.detail || "Deposit verification failed" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // ✅ Create Withdrawal
  const createWithdrawal = async (withdrawalData: any) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_BASE_URL}/api/wallet/withdraw`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withdrawalData),
      });

      const data = await response.json();
      if (response.ok) {
        await fetchWallet();
        await fetchWithdrawals();
        return { success: true, data };
      }
      return { success: false, error: data.detail || "Withdrawal failed" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // ✅ Razorpay Integration
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const initiatePayment = async (
    amount: number,
    onSuccess?: (data: any) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setLoading(true);
      const orderResult = await createDepositOrder(amount);
      if (!orderResult.success) return onError?.(orderResult.error);

      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) return onError?.("Failed to load Razorpay");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        name: "WinQuizz",
        description: "Add money to wallet",
        order_id: orderResult.data.order_id,
        handler: async (response: any) => {
          const verifyResult = await verifyDeposit(
            orderResult.data.payment_id,
            response
          );
          verifyResult.success
            ? onSuccess?.(verifyResult.data)
            : onError?.(verifyResult.error!);
        },
        prefill: {
          name: user?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: { user_id: user?.id },
        theme: { color: "#dc2626" },
        modal: { ondismiss: () => onError?.("Payment cancelled") },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      onError?.(error.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "text-green-600 bg-green-100";
      case "WITHDRAWAL":
        return "text-red-600 bg-red-100";
      case "CONTEST_FEE":
        return "text-orange-600 bg-orange-100";
      case "PRIZE_MONEY":
        return "text-green-600 bg-green-100";
      case "REFERRAL_BONUS":
        return "text-blue-600 bg-blue-100";
      case "REFUND":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "💰";
      case "WITHDRAWAL":
        return "🏦";
      case "CONTEST_FEE":
        return "🎯";
      case "PRIZE_MONEY":
        return "🏆";
      case "REFERRAL_BONUS":
        return "🎁";
      case "REFUND":
        return "↩️";
      default:
        return "💳";
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
      fetchWithdrawals();
    } else {
      setWallet(null);
      setTransactions([]);
      setWithdrawals([]);
    }
  }, [user]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        withdrawals,
        loading,
        fetchWallet,
        fetchTransactions,
        fetchWithdrawals,
        createDepositOrder,
        verifyDeposit,
        createWithdrawal,
        initiatePayment,
        getTransactionTypeColor,
        getTransactionIcon,
        refreshWallet: fetchWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
