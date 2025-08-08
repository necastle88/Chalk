export const formatDate = (dateString: string, compact: boolean = false) => {
  const date = new Date(dateString);
  if (compact) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCategory = (category: string) => {
  return (
    category.charAt(0) + category.slice(1).toLowerCase().replace("_", " ")
  );
};

export const calculateDateRange = (dateFilter: string): Date | undefined => {
  if (dateFilter && dateFilter !== "all") {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateFilter));
    return startDate;
  }
  return undefined;
};
