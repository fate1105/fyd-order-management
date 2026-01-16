// Facebook SDK initialization for Vite
// This loads the Facebook SDK with the App ID from environment variables

// Track if SDK is ready
window.fbSdkReady = false;

export function initFacebookSdk() {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  
  console.log('Initializing Facebook SDK with App ID:', appId);
  
  if (!appId || appId === 'YOUR_FACEBOOK_APP_ID') {
    console.warn('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in .env file.');
    return;
  }

  // Define fbAsyncInit before loading SDK
  window.fbAsyncInit = function() {
    window.FB.init({
      appId: appId,
      cookie: true,
      xfbml: true,
      version: 'v18.0'
    });
    window.fbSdkReady = true;
    console.log('Facebook SDK initialized successfully!');
  };

  // Load Facebook SDK script
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      console.log('Facebook SDK script already exists');
      return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/vi_VN/sdk.js";
    js.onerror = function() {
      console.error('Failed to load Facebook SDK');
    };
    fjs.parentNode.insertBefore(js, fjs);
    console.log('Facebook SDK script loading...');
  }(document, 'script', 'facebook-jssdk'));
}

export default initFacebookSdk;
