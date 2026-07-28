// Shared formatting helpers

export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `Ksh. ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });