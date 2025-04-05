export interface EmailTemplateProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}

export function getBaseTemplate({
  title,
  content,
  buttonText,
  buttonUrl,
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">
          Equity<span>MD</span>
        </div>
        
        <div class="title">${title}</div>
        
        <div class="content">
          ${content}
        </div>

        ${buttonText && buttonUrl ? `
          <div style="text-align: center;">
            <a href="${buttonUrl}" class="button">
              ${buttonText}
            </a>
          </div>
        ` : ''}
      </div>

      <div class="footer">
        <p>You received this email because you have notifications enabled.</p>
        <p>To update your preferences, visit your profile settings.</p>
      </div>
    </div>
  </body>
</html>
  `;
}