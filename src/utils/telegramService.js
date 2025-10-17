// Telegram notification service for visitor tracking
const TELEGRAM_BOT_TOKEN = '7951024592:AAGwxyhmKXLS1yjPCnQ-b9O4RDZQPSmO2Qc';
const TELEGRAM_CHAT_ID = '1772426608';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Get visitor's IP address
const getVisitorIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'Unknown';
  }
};

// Get visitor's location using IP geolocation
const getVisitorLocation = async (ip) => {
  try {
    if (ip === 'Unknown') return null;
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    if (data.error) {
      console.error('IP geolocation error:', data.reason);
      return null;
    }
    
    return {
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      latitude: data.latitude,
      longitude: data.longitude,
      isp: data.org || 'Unknown'
    };
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
};

// Get visitor information
const getVisitorInfo = async () => {
  const now = new Date();
  const timestamp = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const basicInfo = {
    timestamp,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer || 'Direct visit',
    url: window.location.href,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  // Get IP and location
  const ip = await getVisitorIP();
  const location = await getVisitorLocation(ip);
  
  basicInfo.ipAddress = ip;
  basicInfo.location = location;

  return basicInfo;
};

// Format visitor information for Telegram message
const formatVisitorMessage = (visitorInfo) => {
  let locationInfo = '';
  
  if (visitorInfo.location) {
    const { city, region, country, latitude, longitude } = visitorInfo.location;
    const gmapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    
    locationInfo = `📍 *${city}, ${region}, ${country}*
🗺️ [View on Google Maps](${gmapsLink})

`;
  }

  return `🚀 *New Visitor - SafeHorizon*

📅 ${visitorInfo.timestamp}
🌐 ${visitorInfo.url}
${locationInfo}📱 ${visitorInfo.platform} • ${visitorInfo.language}
🔍 ${visitorInfo.userAgent.split(' ').slice(-2).join(' ')}`;
};

// Send notification to Telegram
export const sendVisitorNotification = async () => {
  try {
    const visitorInfo = await getVisitorInfo();
    const message = formatVisitorMessage(visitorInfo);

    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    if (response.ok) {
      console.log('✅ Visitor notification sent to Telegram successfully');
      return { success: true };
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to send Telegram notification:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    return { success: false, error: error.message };
  }
};

// Send custom message to Telegram
export const sendCustomMessage = async (message) => {
  try {
    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    if (response.ok) {
      console.log('✅ Custom message sent to Telegram successfully');
      return { success: true };
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to send custom Telegram message:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('❌ Error sending custom Telegram message:', error);
    return { success: false, error: error.message };
  }
};

// Simple visitor tracking - send notification immediately
export const trackVisitor = async () => {
  try {
    console.log('🚀 Tracking visitor...');
    
    // Get basic visitor info
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const userAgent = navigator.userAgent.split(' ').slice(-2).join(' ');
    const platform = navigator.platform;
    const language = navigator.language;
    const url = window.location.href;
    
    // Get IP and location
    let locationInfo = '';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      if (ipData.ip) {
        const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const locationData = await locationResponse.json();
        
        if (locationData.city && locationData.region && locationData.country) {
          const gmapsLink = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
          locationInfo = `📍 *${locationData.city}, ${locationData.region}, ${locationData.country}*
🗺️ [View on Google Maps](${gmapsLink})

`;
        }
      }
    } catch (locationError) {
      console.log('Location detection failed:', locationError);
    }
    
    // Create simple message
    const message = `🚀 *New Visitor - SafeHorizon*

📅 ${timestamp}
🌐 ${url}
${locationInfo}📱 ${platform} • ${language}
🔍 ${userAgent}`;

    // Send to Telegram
    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    if (response.ok) {
      console.log('✅ Visitor notification sent successfully');
    } else {
      console.error('❌ Failed to send notification:', response.status);
    }
  } catch (error) {
    console.error('❌ Visitor tracking error:', error);
  }
};

const telegramService = {
  sendVisitorNotification,
  sendCustomMessage,
  trackVisitor
};

export default telegramService;
