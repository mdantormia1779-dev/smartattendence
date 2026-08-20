export interface PaymentRequest {
    id: string;
    organization: string;
    planName: string;
    amount: string;
    billingCycle: "Monthly" | "Yearly";
    date: string;
    status: "Pending" | "Approved" | "Rejected";
    transactionId: string;
    senderNumber?: string;
}