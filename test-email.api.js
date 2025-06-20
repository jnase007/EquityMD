
const response = fetch("https://frtxsynlvwhpnzzgfgbt.supabase.co/functions/v1/send-email-api", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydHhzeW5sdndocG56emdmZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzM5NDAsImV4cCI6MjA1NzEwOTk0MH0.dQa_uTFztE4XxC9owtszePY-hcMLF9rVJfL01wrHYjg",
    },
    body: JSON.stringify({
        "name": "John Doe",
        "email": "johndoe@test.com",
        "subject": "Test Email",
        "type": "syndicator",
        "signupDate": "2023-10-01",
    })
}).then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}).then(data => {
    console.log("Email sent successfully:", data);
}).catch(error => {
    console.error("Error sending email:", error);
});