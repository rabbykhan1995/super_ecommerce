export const generateEmailTemplate=(code:number, type:string)=> {
  const title =
    type === "reset" ? "Password Reset Code" : "Email Verification Code";

  const message =
    type === "reset"
      ? "Use the code below to reset your password."
      : "Use the code below to verify your email address.";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:30px;">
            
            <tr>
              <td style="text-align:center;">
                <h2 style="margin:0;color:#333;">${title}</h2>
              </td>
            </tr>

            <tr>
              <td style="padding-top:20px;text-align:center;color:#555;font-size:16px;">
                ${message}
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:30px 0;">
                <div style="
                  font-size:32px;
                  font-weight:bold;
                  letter-spacing:6px;
                  color:#2d6cdf;
                  background:#f2f5ff;
                  display:inline-block;
                  padding:15px 25px;
                  border-radius:6px;
                ">
                  ${Number(code)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="text-align:center;color:#777;font-size:14px;">
                This code will expire in 5 minutes.
              </td>
            </tr>

            <tr>
              <td style="padding-top:30px;text-align:center;color:#999;font-size:12px;">
                If you didn’t request this, you can safely ignore this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
}