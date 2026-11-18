"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  Merchant,
  FeeAgreement,
  SettlementPolicy,
  ConfigurationWarning,
  INITIAL_MERCHANTS,
  INITIAL_FEE_AGREEMENTS,
  INITIAL_SETTLEMENT_POLICIES,
  INITIAL_WARNINGS,
} from "@/lib/mock-data";

interface WorkspaceContextType {
  merchants: Merchant[];
  feeAgreements: FeeAgreement[];
  settlementPolicies: SettlementPolicy[];
  warnings: ConfigurationWarning[];
  selectedMerchantId: string;
  selectedMerchant: Merchant;
  setSelectedMerchantId: (id: string) => void;
  addMerchant: (merchant: Omit<Merchant, "id" | "createdAt">) => void;
  addFeeAgreement: (agreement: Omit<FeeAgreement, "id">) => void;
  addSettlementPolicy: (policy: Omit<SettlementPolicy, "id">) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [feeAgreements, setFeeAgreements] = useState<FeeAgreement[]>(INITIAL_FEE_AGREEMENTS);
  const [settlementPolicies, setSettlementPolicies] = useState<SettlementPolicy[]>(INITIAL_SETTLEMENT_POLICIES);
  const [warnings] = useState<ConfigurationWarning[]>(INITIAL_WARNINGS);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(
    INITIAL_MERCHANTS[0]?.id || "mer_apex_cloud"
  );

  const selectedMerchant: Merchant = useMemo(() => {
    const found = merchants.find((m) => m.id === selectedMerchantId);
    if (found) return found;
    const first = merchants[0];
    if (first) return first;
    return INITIAL_MERCHANTS[0] as Merchant;
  }, [merchants, selectedMerchantId]);

  const addMerchant = (newMerchant: Omit<Merchant, "id" | "createdAt">) => {
    const id = `mer_${newMerchant.slug}_${Date.now().toString().slice(-4)}`;
    const created: Merchant = {
      ...newMerchant,
      id,
      createdAt: new Date().toISOString().split("T")[0] || "2026-01-01",
    };
    setMerchants((prev) => [created, ...prev]);
    setSelectedMerchantId(id);
  };

  const addFeeAgreement = (newAgreement: Omit<FeeAgreement, "id">) => {
    const id = `fee_${Date.now().toString().slice(-6)}`;
    const created: FeeAgreement = {
      ...newAgreement,
      id,
    };
    setFeeAgreements((prev) => [created, ...prev]);
  };

  const addSettlementPolicy = (newPolicy: Omit<SettlementPolicy, "id">) => {
    const id = `pol_${Date.now().toString().slice(-6)}`;
    const created: SettlementPolicy = {
      ...newPolicy,
      id,
    };
    setSettlementPolicies((prev) => [created, ...prev]);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        merchants,
        feeAgreements,
        settlementPolicies,
        warnings,
        selectedMerchantId,
        selectedMerchant,
        setSelectedMerchantId,
        addMerchant,
        addFeeAgreement,
        addSettlementPolicy,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
