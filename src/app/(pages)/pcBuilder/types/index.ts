import { ReactNode } from 'react';

export type ComponentType = 'gpu' | 'cpu' | 'motherboard' | 'ram';

export type PCComponent = {
  id: string;
  name: string;
  price: number;
  company: string;
  type: ComponentType;
  image?: string;
};

export type BuildPurpose = {
  id: string;
  name: string;
  description: string;
  minBudget: number;
  maxBudget: number;
  icon: ReactNode;
};

export type BudgetRange = {
  label: string;
  value: number;
};

export type ComponentRecommendation = {
  type: ComponentType;
  minPrice: number;
  maxPrice: number;
  percentage: number;
  priority: number;
};

export type BudgetFlexibility = 'strict' | 'flexible' | 'very_flexible';

export type BudgetFlexibilityOption = {
  id: BudgetFlexibility;
  label: string;
  description: string;
  icon: ReactNode;
};

export type PCBuild = {
  id: string;
  name: string;
  budget: number;
  purpose: string;
  budgetFlexibility: BudgetFlexibility;
  components: {
    gpu?: PCComponent;
    cpu?: PCComponent;
    motherboard?: PCComponent;
    ram?: PCComponent;
  };
}; 