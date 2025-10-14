const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, otp, accountSid, authToken, from } = req.body;

  if (!to || !otp || !accountSid || !authToken || !from) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `Your WinQuizz verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: from,
      to: to
    });

    console.log('SMS sent successfully:', message.sid);
    res.status(200).json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
}
