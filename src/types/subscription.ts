export interface PlanLimit {
  label: string;
  value: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  period: string;
  limits: PlanLimit[];
  features: string[];
  isPopular?: boolean;
  usageCount: number;
}