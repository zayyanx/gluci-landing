const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Add to Resend audience
    if (process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID,
        unsubscribed: false,
      });
    }

    // Confirmation email to user
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: "You're on the Gluci waitlist",
      html: `
        <p>Hey,</p>
        <p>You're on the list. We'll reach out the moment Gluci is ready for early access.</p>
        <p>— The Gluci Team</p>
      `,
    });

    // Notify owner
    if (process.env.NOTIFY_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: process.env.NOTIFY_EMAIL,
        subject: `New waitlist signup: ${email}`,
        html: `<p><strong>${email}</strong> just joined the Gluci waitlist.</p>`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gluci server on port ${PORT}`));
