export default `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🚀 You've Been Selected - Welcome to EquityMD</title>

    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

    <style>
      .hero-section {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 40px 32px;
        border-radius: 8px 8px 0 0;
        text-align: center;
        margin: -32px -32px 32px -32px;
      }
      .hero-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 16px;
      }
      .hero-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 24px;
      }
      .deal-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
        margin: 32px 0;
      }
      .deal-card {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        background: white;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .deal-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      .deal-image {
        width: 100%;
        height: 200px;
        background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        font-weight: 600;
      }
      .deal-content {
        padding: 20px;
      }
      .deal-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
      }
      .deal-location {
        color: #6b7280;
        font-size: 14px;
        margin-bottom: 12px;
      }
      .deal-highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      .deal-highlight {
        background: #f3f4f6;
        color: #374151;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      .deal-cta {
        background: #2563eb;
        color: white;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        display: inline-block;
      }
      .stats-section {
        background: #f8fafc;
        border-radius: 12px;
        padding: 24px;
        margin: 32px 0;
        text-align: center;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 24px;
        margin-top: 20px;
      }
      .stat-item {
        text-align: center;
      }
      .stat-number {
        font-size: 24px;
        font-weight: 700;
        color: #2563eb;
        display: block;
      }
      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-top: 4px;
      }
      .feature-list {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
      }
      .feature-list h3 {
        color: #0369a1;
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }
      .feature-list ul {
        margin: 0;
        padding-left: 20px;
      }
      .feature-list li {
        margin-bottom: 6px;
        color: #0c4a6e;
      }
      .urgent-cta {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: white;
        padding: 24px;
        border-radius: 12px;
        text-align: center;
        margin: 32px 0;
      }
      .urgent-cta h3 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .urgent-cta p {
        opacity: 0.9;
        margin-bottom: 16px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="hero-section">
          <div class="logo" style="color: white; margin-bottom: 16px">
            Equity<span style="color: #fbbf24">MD</span>
          </div>
          <div class="hero-title">🚀 You've Been Selected!</div>
          <div class="hero-subtitle">
            Welcome to EquityMD - The Premier Platform for Accredited Real
            Estate Investors
          </div>
        </div>

        <div class="content">
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://equitymd.com/how-it-works" style="display: inline-block; text-decoration: none;">
              <img 
                src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/images/video_commercial.png" 
                alt="EquityMD Commercial Video" 
                style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
              />
            </a>
            <p style="margin-top: 12px; color: #6b7280; font-size: 14px;">Click to watch our commercial and learn how EquityMD works</p>
          </div>
          
          <p>
            <strong>Congratulations {{first_name}}!</strong> You've been selected
            as a candidate for our exclusive real estate investment platform,
            EquityMD.
          </p>

          <p>
            We've identified you as a qualified accredited investor and are
            excited to invite you to join our growing community of sophisticated
            real estate investors.
          </p>

          <div class="stats-section">
            <h3 style="margin-bottom: 16px; color: #1f2937">
              Platform Highlights
            </h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-number">3+</span>
                <span class="stat-label">Syndicators</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">7,400+</span>
                <span class="stat-label">Investors</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">18.5%</span>
                <span class="stat-label">Average IRR</span>
              </div>
            </div>
          </div>

          <h3 style="color: #1f2937; margin: 32px 0 16px 0;">See How EquityMD Works</h3>
          <p style="margin-bottom: 24px; color: #6b7280;">Watch our commercial to learn how we connect accredited investors with institutional-quality real estate opportunities:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://equitymd.com/how-it-works" style="display: inline-block; text-decoration: none;">
              <div style="position: relative; width: 100%; max-width: 500px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="position: relative; padding-bottom: 56.25%; background: linear-gradient(45deg, #2563eb, #1d4ed8);">
                  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: white;">
                    <div style="text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 16px;">▶️</div>
                      <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">EquityMD Commercial</div>
                      <div style="font-size: 14px; opacity: 0.9;">Click to watch and learn more</div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>

          <h3 style="color: #1f2937; margin: 32px 0 16px 0">
            Featured Investment Opportunities
          </h3>
          <p>
            Take a look at some of the premium deals currently available on our
            platform:
          </p>

          <div class="deal-grid">
            <div
              class="deal-card"
              style="
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              "
            >
              <div
                class="deal-image"
                style="position: relative; height: 200px; overflow: hidden"
              >
                <img
                  src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//Backbay_Newport.jpg"
                  alt="Newport Beach Residential Offering"
                  style="width: 100%; height: 100%; object-fit: cover"
                />
              </div>
              <div class="deal-content" style="padding: 20px">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                  "
                >
                  <div
                    class="deal-title"
                    style="font-size: 18px; font-weight: 600; color: #1f2937"
                  >
                    Newport Beach Residential Offering
                  </div>
                  <div
                    style="
                      background: linear-gradient(135deg, #fbbf24, #f59e0b);
                      color: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 12px;
                      font-weight: 600;
                      display: flex;
                      align-items: center;
                    "
                  >
                    <span style="margin-right: 4px">👑</span> Premier Partner
                  </div>
                </div>
                <div
                  class="deal-location"
                  style="color: #6b7280; font-size: 14px; margin-bottom: 16px"
                >
                  Newport Beach, CA
                </div>
                <div
                  style="
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                    margin-bottom: 16px;
                  "
                >
                  <div
                    style="
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 12px;
                    "
                  >
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Target Return
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        20% IRR
                      </div>
                    </div>
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Minimum
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        $250,000
                      </div>
                    </div>
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Term
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        2 years
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://equitymd.com/deals/newport-beach-residential-offering"
                  class="deal-cta"
                  style="
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    padding: 12px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    display: inline-block;
                    width: 100%;
                    text-align: center;
                  "
                  >View Details ></a
                >
              </div>
            </div>

            <div
              class="deal-card"
              style="
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              "
            >
              <div
                class="deal-image"
                style="position: relative; height: 200px; overflow: hidden"
              >
                <img
                  src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media//adu.png"
                  alt="Multifamily ADU Opportunity"
                  style="width: 100%; height: 100%; object-fit: cover"
                />
              </div>
              <div class="deal-content" style="padding: 20px">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                  "
                >
                  <div
                    class="deal-title"
                    style="font-size: 18px; font-weight: 600; color: #1f2937"
                  >
                    Multifamily ADU Opportunity
                  </div>
                  <div
                    style="
                      background: linear-gradient(135deg, #fbbf24, #f59e0b);
                      color: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 12px;
                      font-weight: 600;
                      display: flex;
                      align-items: center;
                    "
                  >
                    <span style="margin-right: 4px">👑</span> Premier Partner
                  </div>
                </div>
                <div
                  class="deal-location"
                  style="color: #6b7280; font-size: 14px; margin-bottom: 16px"
                >
                  Southern California
                </div>
                <div
                  style="
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                    margin-bottom: 16px;
                  "
                >
                  <div
                    style="
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 12px;
                    "
                  >
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Target Return
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        30% IRR
                      </div>
                    </div>
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Minimum
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        $50,000
                      </div>
                    </div>
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Term
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        3 years
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://equitymd.com/deals/multifamily-adu-opportunity"
                  class="deal-cta"
                  style="
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    padding: 12px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    display: inline-block;
                    width: 100%;
                    text-align: center;
                  "
                  >View Details ></a
                >
              </div>
            </div>

            <div
              class="deal-card"
              style="
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              "
            >
              <div
                class="deal-image"
                style="position: relative; height: 200px; overflow: hidden"
              >
                <img
                  src="https://frtxsynlvwhpnzzgfgbt.supabase.co/storage/v1/object/public/deal-media/liva_2025/IMG_0982.jpeg"
                  alt="Greenville Apartment Complex"
                  style="width: 100%; height: 100%; object-fit: cover"
                />
              </div>
              <div class="deal-content" style="padding: 20px">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                  "
                >
                  <div
                    class="deal-title"
                    style="font-size: 18px; font-weight: 600; color: #1f2937"
                  >
                    Greenville Apartment Complex
                  </div>
                  <div
                    style="
                      background: linear-gradient(135deg, #fbbf24, #f59e0b);
                      color: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 12px;
                      font-weight: 600;
                      display: flex;
                      align-items: center;
                    "
                  >
                    <span style="margin-right: 4px">👑</span> Premier Partner
                  </div>
                </div>
                <div
                  class="deal-location"
                  style="color: #6b7280; font-size: 14px; margin-bottom: 16px"
                >
                  Travelers Rest, SC
                </div>
                <div
                  style="
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                    margin-bottom: 16px;
                  "
                >
                  <div
                    style="
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 12px;
                    "
                  >
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Target Return
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        17.19% IRR
                      </div>
                    </div>
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Minimum
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        $50,000
                      </div>
                    </div>
                    <div>
                      <div
                        style="
                          font-size: 12px;
                          color: #6b7280;
                          margin-bottom: 4px;
                        "
                      >
                        Term
                      </div>
                      <div
                        style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #2563eb;
                        "
                      >
                        5 years
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://equitymd.com/deals/greenville-apartment-complex"
                  class="deal-cta"
                  style="
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    padding: 12px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    display: inline-block;
                    width: 100%;
                    text-align: center;
                  "
                  >View Details ></a
                >
              </div>
            </div>
          </div>

          <div class="feature-list">
            <h3>🎯 Why Complete Your Profile?</h3>
            <ul>
              <li>
                <strong>Exclusive Access:</strong> View detailed deal
                documentation and financial projections
              </li>
              <li>
                <strong>Direct Communication:</strong> Connect directly with
                syndicators and ask questions
              </li>
              <li>
                <strong>Portfolio Tracking:</strong> Monitor your investments
                and track performance
              </li>
              <li>
                <strong>New Deals Monthly:</strong> Get early access to fresh
                opportunities hitting the market
              </li>
              <li>
                <strong>Professional Network:</strong> Build relationships with
                top-tier real estate professionals
              </li>
            </ul>
          </div>

          <div class="urgent-cta">
            <h3>⏰ Limited Time Opportunity</h3>
            <p>
              New deals are hitting the market every month. Complete your
              profile now to ensure you don't miss out on these exclusive
              investment opportunities.
            </p>
            <a
              href="https://equitymd.com"
              class="button"
              style="background: white; color: #2563eb; font-weight: 600"
            >
              Complete Your Profile Now
            </a>
          </div>

          <p style="margin-top: 32px"><strong>About EquityMD:</strong></p>
          <p>
            EquityMD is the premier platform connecting accredited investors
            with exclusive commercial real estate opportunities. We partner with
            top-tier syndicators to bring you carefully vetted deals with strong
            return potential.
          </p>

          <p>
            Our platform provides transparency, professional due diligence, and
            direct access to syndicators - everything you need to make informed
            investment decisions.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px">
          <a href="https://equitymd.com" class="button">
            🚀 Get Started Now
          </a>
        </div>
      </div>

      <div class="footer">
        <p>
          You received this email because you've been selected as a qualified
          investor candidate.
        </p>
        <p>Questions? Contact us at hello@equitymd.com</p>
        <p>© 2025 EquityMD. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;
