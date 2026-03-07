# Test: Employer Notification System

## How to Test the Notification System

1. **Setup:**
   - Ensure you have at least 2 users: one EMPLOYER and one WORKER
   - The EMPLOYER should have posted at least one job

2. **Test Steps:**
   - Login as the WORKER
   - Navigate to a job posted by the EMPLOYER
   - Click "Apply" to submit an application
   - Login as the EMPLOYER
   - Check the notification bell (top right) - should show a new notification
   - The notification should display:
     - Title: "New Job Application! 📋"
     - Message: "[Worker Name] has applied for your position: [Job Title]"
     - Type: "APPLICATION"

3. **Expected Results:**
   - Employer receives immediate notification when worker applies
   - Notification appears in the notification dropdown
   - Unread count increases
   - Notification can be marked as read

## Implementation Details

The notification is created in `/api/applications/route.ts` after successful application creation:

```typescript
// Create notification for the employer
await prisma.notification.create({
  data: {
    userId: job.employerId,
    title: "New Job Application! 📋",
    message: `${workerDetails.name} has applied for your position: ${application.job?.title || "Job"}`,
    type: "APPLICATION"
  }
});
```

## Files Modified

- `/src/app/api/applications/route.ts` - Added notification creation logic
