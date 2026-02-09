/**
 * Build the Hotels search URL with default params (all hotels, no filters)
 */
export const getHotelsSearchUrl = () => {
  const checkIn = new Date();
  const checkOut = new Date();
  checkOut.setDate(checkOut.getDate() + 1);
  const params = new URLSearchParams({
    destination: "",
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    adultCount: "1",
    childCount: "1",
    sortOption: "",
    page: "1",
  });
  return `/search?${params.toString()}`;
};
