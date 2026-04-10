export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  // Display as "Month Day, Year" format e.g., "January 1, 2030"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}