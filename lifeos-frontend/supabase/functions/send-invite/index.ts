import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InviteRequest {
  emails: string[];
  inviterName: string;
  inviterUsername?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header - optional during onboarding
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    // Try to verify user if auth header provided
    if (authHeader && authHeader !== 'Bearer ' && authHeader !== 'Bearer null') {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (!authError && user) {
          userId = user.id;
        }
      } catch (e) {
        // Auth failed, continue without user ID
        console.log("Auth check failed, proceeding without user ID");
      }
    }

    // Parse request body
    const { emails, inviterName, inviterUsername }: InviteRequest = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No emails provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(e => emailRegex.test(e));

    if (validEmails.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid emails provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit to 5 invites at a time
    const emailsToSend = validEmails.slice(0, 5);

    // Generate invite link - use environment variable or default
    const baseUrl = Deno.env.get("APP_URL") || "https://onyx-lifeos.vercel.app";
    const inviteLink = baseUrl;

    // Send emails
    const results = await Promise.allSettled(
      emailsToSend.map(async (email) => {
        const { data, error } = await resend.emails.send({
          from: "Taylor from LifeOS <taylor@avarismarketing.com>",
          to: email,
          subject: `${inviterName} invited you to join LifeOS`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0812; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0812;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" width="100%" style="max-width: 500px; background: linear-gradient(135deg, #1a1625 0%, #0f0d15 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 32px 32px 24px; text-align: center;">
                          <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">You're Invited!</h1>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding: 0 32px 24px;">
                          <p style="margin: 0 0 16px; color: #a0a0b0; font-size: 16px; line-height: 1.6; text-align: center;">
                            <strong style="color: #ffffff;">${inviterName}</strong>${inviterUsername ? ` (@${inviterUsername})` : ''} thinks you'd love LifeOS - the personal operating system for tracking everything that matters.
                          </p>

                          <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
                            <p style="margin: 0 0 12px; color: #c4b5fd; font-size: 14px; font-weight: 600;">What you can track:</p>
                            <ul style="margin: 0; padding-left: 20px; color: #a0a0b0; font-size: 14px; line-height: 1.8;">
                              <li>Productivity & deep work sessions</li>
                              <li>Health, fitness & nutrition</li>
                              <li>Learning & skill development</li>
                              <li>Finances & goals</li>
                              <li>Journal & daily reflections</li>
                            </ul>
                          </div>
                        </td>
                      </tr>

                      <!-- CTA Button -->
                      <tr>
                        <td style="padding: 0 32px 32px; text-align: center;">
                          <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 10px;">Join LifeOS</a>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                          <p style="margin: 0; color: #6b6b7b; font-size: 12px;">
                            This invite was sent by ${inviterName}. If you didn't expect this email, you can safely ignore it.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });

        if (error) {
          throw error;
        }
        return { email, success: true, id: data?.id };
      })
    );

    // Process results
    const successful = results
      .filter((r): r is PromiseFulfilledResult<{ email: string; success: boolean; id: string }> => r.status === "fulfilled")
      .map((r) => r.value);

    const failed = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r, i) => ({ email: emailsToSend[i], error: r.reason?.message || "Unknown error" }));

    // Log invites to database if we have successful sends
    if (successful.length > 0) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        await supabaseAdmin.from("invite_logs").insert(
          successful.map((s) => ({
            inviter_id: userId, // Can be null for unauthenticated onboarding invites
            invitee_email: s.email,
            sent_at: new Date().toISOString(),
          }))
        );
      } catch (logError) {
        // Don't fail the request if logging fails
        console.error("Failed to log invites:", logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful.length,
        failed: failed.length,
        results: { successful, failed },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invites:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
