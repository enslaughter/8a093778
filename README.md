# Technical Assessment (Frontend)
Hello, this is Eli Slaughter. I have written a small memo on my submission for the completion of your frontend assignment.

I completed the assessment to the best of my ability though there are some spots I would have liked to polish, had time permitted. A priority of mine was to ensure that the app was usable for the review of your recruitment team, so you may run into parts of the code that are unused. I've left some notes in comments in the code that you may run into.

## Remarks
- I opted for a simple design based off of what was shown and what I typically work on. I aimed to keep it functional on the most common device sizes.
- As the assessment was open-ended, I opted for the use of axios for the API calls and Styled Components for styling. 
- For future improvements, I would refactor the code where needed and look into implementing a proper context to reduce prop drilling. MaterialUI could be used to make certain functionality like tabs and modals more robust. Cypress tests would be another to-do but that seemed out of scope for the assessment.

  ### Known Issues
  - Occasionally, the page will not update immediately when resetting all calls or archiving all calls.
  - Date dividers will not clear when all calls under a divider are archived. I had begun work on resolving this but did not have enough time to complete the fix.
  - The API logic for archiving/un-archiving individual calls in the call detail view is functional, but I did not have the time to iron out the UI/UX. In the public release the button for toggling a call's archive state has been removed for stability. 
