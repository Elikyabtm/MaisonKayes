export const formatMoney = (cents: number, currency = "eur") =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
