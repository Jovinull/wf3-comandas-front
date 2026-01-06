export function formatBRL(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safe);
}
