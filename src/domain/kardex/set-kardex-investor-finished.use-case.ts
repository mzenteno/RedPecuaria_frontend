export interface SetKardexInvestorFinishedData {
  investmentId: string;
  investorUserId: string;
  isFinished: boolean;
}

/** Botón "Finalizar"/"Reactivar" del Kardex de un inversionista — "terminada"
 * es por inversionista desde 2026-10-19 (ver `InvestmentInvestor` en el
 * backend). */
export interface SetKardexInvestorFinishedUseCase {
  execute(data: SetKardexInvestorFinishedData): Promise<void>;
}
