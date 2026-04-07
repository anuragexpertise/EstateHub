
import { create } from 'zustand';
import { rates as defaultRates } from '@/lib/data';

type ApartmentRates = {
    '1month': number;
    '3month': number;
    '6month': number;
    '12month': number;
  };

type ContractorRates = {
    '1day': number;
    '7day': number;
    '1month': number;
};

type FineRates = {
    latePaymentFee: number;
    finePercentPerDay: number;
};

interface GlobalState {
  societyName: string;
  logoUrl: string | null;
  loginHeroUrl: string | null;
  receiptQrUrl: string | null;
  calculationStartDate: string | null;
  apartmentRates: ApartmentRates;
  contractorRates: ContractorRates;
  fineRates: FineRates;
  isLoaded: boolean;
  initializeStore: (initialState: Partial<GlobalState>) => void;
  setSocietyName: (name: string) => void;
  setLogoUrl: (url: string | null) => void;
  setLoginHeroUrl: (url: string | null) => void;
  setReceiptQrUrl: (url: string | null) => void;
  setCalculationStartDate: (date: string | null) => void;
  setApartmentRates: (rates: ApartmentRates) => void;
  setContractorRates: (rates: ContractorRates) => void;
  setFineRates: (rates: FineRates) => void;
}

export const useGlobalStore = create<GlobalState>()((set) => ({
      societyName: 'EstateHub',
      logoUrl: null,
      loginHeroUrl: null,
      receiptQrUrl: null,
      calculationStartDate: new Date('2025-10-01T00:00:00.000Z').toISOString(),
      apartmentRates: defaultRates.apartment,
      contractorRates: defaultRates.contractor,
      fineRates: defaultRates.fines,
      isLoaded: false,
      initializeStore: (initialState) => set((state) => ({ ...state, ...initialState, isLoaded: true })),
      setSocietyName: (name) => set({ societyName: name }),
      setLogoUrl: (url) => set({ logoUrl: url }),
      setLoginHeroUrl: (url) => set({ loginHeroUrl: url }),
      setReceiptQrUrl: (url) => set({ receiptQrUrl: url }),
      setCalculationStartDate: (date) => set({ calculationStartDate: date }),
      setApartmentRates: (rates) => set({ apartmentRates: rates }),
      setContractorRates: (rates) => set({ contractorRates: rates }),
      setFineRates: (rates) => set({ fineRates: rates }),
}));

    