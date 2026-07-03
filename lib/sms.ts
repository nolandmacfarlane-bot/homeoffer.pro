/**
 * SMS Utility Functions
 * 
 * These functions send SMS notifications via Twilio.
 * Currently placeholders - will be activated when Twilio phone number is added to env vars.
 */

export interface SMSNotification {
  to: string
  message: string
  type: 'approval-request' | 'approval-confirmation' | 'new-offer' | 'outbid' | 'offer-won' | 'offer-closed'
}

/**
 * Send SMS notification to buyer
 * PLACEHOLDER: Will integrate with /api/sms/send when Twilio is ready
 */
export async function sendBuyerSMS(
  phoneNumber: string,
  message: string,
  notificationType: string
) {
  try {
    console.log(`[SMS PLACEHOLDER] Sending to buyer: ${phoneNumber}`)
    console.log(`[SMS PLACEHOLDER] Type: ${notificationType}`)
    console.log(`[SMS PLACEHOLDER] Message: ${message}`)

    // TODO: Activate when Twilio is ready
    // const response = await fetch('/api/sms/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: phoneNumber,
    //     message: message,
    //   }),
    // })
    // return await response.json()

    return { success: true, message: '[PLACEHOLDER] SMS would be sent' }
  } catch (err: any) {
    console.error('SMS send error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Send SMS notification to agent/seller
 * PLACEHOLDER: Will integrate with /api/sms/send when Twilio is ready
 */
export async function sendAgentSMS(
  phoneNumber: string,
  message: string,
  notificationType: string
) {
  try {
    console.log(`[SMS PLACEHOLDER] Sending to agent: ${phoneNumber}`)
    console.log(`[SMS PLACEHOLDER] Type: ${notificationType}`)
    console.log(`[SMS PLACEHOLDER] Message: ${message}`)

    // TODO: Activate when Twilio is ready
    // const response = await fetch('/api/sms/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: phoneNumber,
    //     message: message,
    //   }),
    // })
    // return await response.json()

    return { success: true, message: '[PLACEHOLDER] SMS would be sent' }
  } catch (err: any) {
    console.error('SMS send error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * New offer submitted - notify agent
 */
export async function notifyAgentNewOffer(
  agentPhone: string,
  buyerName: string,
  propertyAddress: string,
  offerAmount: number,
  propertyLink: string
) {
  const message = `New offer alert! ${buyerName} bid $${offerAmount.toLocaleString()} on ${propertyAddress}. Review at: ${propertyLink} Reply STOP to opt-out.`

  return await sendAgentSMS(agentPhone, message, 'new-offer')
}

/**
 * Buyer approved - notify buyer
 */
export async function notifyBuyerApproved(
  buyerPhone: string,
  propertyAddress: string,
  propertyLink: string
) {
  const message = `Approved! Your access is confirmed for ${propertyAddress}. Start bidding: ${propertyLink} Reply STOP to opt-out.`

  return await sendBuyerSMS(buyerPhone, message, 'approval-confirmation')
}

/**
 * Buyer outbid - notify buyer
 */
export async function notifyBuyerOutbid(
  buyerPhone: string,
  propertyAddress: string,
  newHighestOffer: number,
  propertyLink: string
) {
  const message = `You've been outbid on ${propertyAddress}! New highest: $${newHighestOffer.toLocaleString()}. Counter-bid: ${propertyLink} Reply STOP to opt-out.`

  return await sendBuyerSMS(buyerPhone, message, 'outbid')
}

/**
 * Offer won - notify buyer
 */
export async function notifyBuyerOfferWon(
  buyerPhone: string,
  propertyAddress: string,
  winningOffer: number,
  agentEmail: string
) {
  const message = `Congratulations! Your offer of $${winningOffer.toLocaleString()} won on ${propertyAddress}! Contact: ${agentEmail} Reply STOP to opt-out.`

  return await sendBuyerSMS(buyerPhone, message, 'offer-won')
}

/**
 * Bidding closed - notify buyer
 */
export async function notifyBuyerBiddingClosed(
  buyerPhone: string,
  propertyAddress: string,
  finalOffer: number
) {
  const message = `Bidding closed on ${propertyAddress}. Your final offer: $${finalOffer.toLocaleString()}. Reply STOP to opt-out.`

  return await sendBuyerSMS(buyerPhone, message, 'offer-closed')
}

/**
 * Buyer approval request - notify agent
 */
export async function notifyAgentBuyerApprovalRequest(
  agentPhone: string,
  buyerName: string,
  propertyAddress: string,
  dashboardLink: string
) {
  const message = `New approval request from ${buyerName} for ${propertyAddress}. Review: ${dashboardLink} Reply STOP to opt-out.`

  return await sendAgentSMS(agentPhone, message, 'approval-request')
}

/**
 * Log SMS activity for audit trail
 */
export async function logSMSActivity(
  userId: string,
  notificationType: string,
  recipientPhone: string,
  message: string,
  status: 'sent' | 'placeholder' | 'failed'
) {
  console.log({
    timestamp: new Date().toISOString(),
    userId,
    type: notificationType,
    recipient: recipientPhone.slice(-4), // Log last 4 digits only (privacy)
    status,
    message: message.slice(0, 50) + '...', // First 50 chars
  })

  // TODO: Store in database for compliance audit trail
  // const { error } = await supabase.from('sms_log').insert({
  //   user_id: userId,
  //   type: notificationType,
  //   recipient_phone: recipientPhone,
  //   message,
  //   status,
  //   created_at: new Date().toISOString(),
  // })
}
