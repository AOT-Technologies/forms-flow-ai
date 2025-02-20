export const formatDate = (isoString) => {
  const date = new Date(isoString);
  const options = {
    month: "short",
    day: "numeric", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  let formattedDate = date.toLocaleString("en-US", options);
  return formattedDate.replace(/(\w{3}) (\d{1,2}), (\d{4}),/, "$1 $2, $3");
};