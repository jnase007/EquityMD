export default `
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💬 New User Message - EquityMD Admin Alert</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f9fafb;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 32px;
      }
      .logo {
        font-size: 24px;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 24px;
        text-align: center;
      }
      .logo span {
        color: #2563eb;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
      }
      .content {
        color: #4b5563;
        margin-bottom: 24px;
      }
      .button {
        display: inline-block;
        background-color: #2563eb;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        margin-top: 24px;
        font-weight: 500;
      }
      .footer {
        margin-top: 32px;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }
      .info-box {
        background-color: #f3f4f6;
        border-left: 4px solid #2563eb;
        padding: 16px;
        margin: 16px 0;
      }
      .info-box h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
        font-weight: 600;
      }
      .info-box p {
        margin: 0;
        color: #4b5563;
        font-size: 14px;
      }
      .message-box {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
        font-style: italic;
      }
      .urgent {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">
          Equity<span>MD</span>
        </div>
        
        <div class="title">💬 New User-to-Syndicator Message Alert</div>
        
        <div class="content">
          <p>A user has sent a message to a syndicator through the platform.</p>
          
          <div class="info-box">
            <h4>Message Details:</h4>
            <p><strong>From:</strong> {{sender_name}} ({{sender_email}})</p>
            <p><strong>To:</strong> {{recipient_name}}</p>
            <p><strong>Regarding:</strong> {{deal_name}}</p>
            <p><strong>Sent:</strong> {{date}}</p>
          </div>
          
          <div class="message-box">
            <p><strong>Message Content:</strong></p>
            <p>"{{message_content}}"</p>
          </div>
          
          <p><strong>Platform Activity:</strong></p>
          <ul>
            <li>User engagement with syndicator content</li>
            <li>Potential investment interest generated</li>
            <li>Active communication facilitated through platform</li>
          </ul>
          
          <p>This activity indicates healthy platform engagement. Monitor for successful connections and potential deal flow.</p>
        </div>

        <div style="text-align: center;">
          <a href="https://equitymd.com/admin/dashboard?tab=analytics" class="button">
            View Analytics Dashboard
          </a>
        </div>
      </div>

      <div class="footer">
        <p>You received this admin notification because user activity alerts are enabled.</p>
        <p>EquityMD Admin Team • hello@equitymd.com</p>
      </div>
    </div>
  </body>
</html>
`;
