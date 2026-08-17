// Cálculo central de precios de una cita.
// Regla de negocio: el fee de la plataforma SIEMPRE se calcula sobre el precio
// ORIGINAL del servicio; el descuento (promoción) lo absorbe el asesor.
export function calculatePrices({
  servicePriceCents,
  feePercentage,
  discountCents = 0,
}: {
  servicePriceCents: number;
  feePercentage: number;
  discountCents?: number;
}): { advisorEarning: number; platformFee: number; totalCents: number } {
  const advisorEarning = Math.max(servicePriceCents - discountCents, 0);
  const platformFee = Math.round(servicePriceCents * (feePercentage / 100));
  const totalCents = advisorEarning + platformFee;
  return { advisorEarning, platformFee, totalCents };
}
