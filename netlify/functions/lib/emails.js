export function buildNotificationEmail({ quote, inboxUrl }) {
  const subject = `New quote from ${quote.name}`;
  const text = [
    `New quote request.`,
    ``,
    `Name: ${quote.name}`,
    `Email: ${quote.email}`,
    quote.phone ? `Phone: ${quote.phone}` : null,
    `Garment: ${quote.garment}`,
    ``,
    `What needs fixing:`,
    quote.issue,
    ``,
    `Open the inbox to see photos and reply: ${inboxUrl}`,
  ].filter((l) => l !== null).join('\n');
  return { subject, text };
}

export function buildReplyEmail({ quote, replyBody }) {
  const subject = `Your quote from Ryder's Repairs`;
  const text = [
    `Hi ${quote.name},`,
    ``,
    replyBody,
    ``,
    `Ryder's Repairs`,
    `2930 N High Street, Columbus, Ohio 43202`,
  ].join('\n');
  return { subject, text };
}
