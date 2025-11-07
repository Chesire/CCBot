/**
 * Check if current date is within wrapped season (Dec 26 - Jan 31)
 * @returns {boolean} true if within wrapped season
 */
function isWrappedSeason() {
  const now = new Date();
  const month = now.getMonth(); // 0 based
  const day = now.getDate();

  // from boxing day -> end of Jan
  return (month === 11 && day >= 26) || month === 0;
}

module.exports = { isWrappedSeason };
