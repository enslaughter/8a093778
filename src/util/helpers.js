// Separate the dates of each call to be easier to display in the archive and inbox
// This is assuming that the API is correctly returning the calls sorted by date
function sortCallsByDate(calls) {
  if (!calls) {
    return {};
  }
  calls.reverse();
  const sortedCalls = {};
  for (let call of calls) {
    const date = call.created_at.split("T")[0];
    if (sortedCalls[date]) {
      sortedCalls[date].push(call);
    } else {
      sortedCalls[date] = [call];
    }
  }
  console.log(`Sorted calls into the following dates:`);
  console.log(sortedCalls);
  return sortedCalls;
}

export { sortCallsByDate };
