const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, role, inviteLink) => {
  await resend.emails.send({
    from: 'VolunteerBridge <onboarding@resend.dev>',
    to,
    subject: `You have been invited to VolunteerBridge as a ${role}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1D9E75;">Welcome to VolunteerBridge!</h2>
        <p>You have been invited to join VolunteerBridge as a <strong>${role}</strong>.</p>
        <p>Click the button below to set up your account:</p>
        <a href="${inviteLink}" 
           style="background-color: #1D9E75; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 8px; display: inline-block;">
          Accept Invite
        </a>
        <p style="color: #999; margin-top: 20px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `
  });
};

module.exports = sendEmail;