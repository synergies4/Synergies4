const { favicons } = require('favicons');
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../public/faviconio.svg'); // Source image
const configuration = {
  path: "/",                                // Path for overriding default icons path. `string` (default: `/`)
  appName: "Synergies4",                    // Your application's name. `string`
  appShortName: "S4",                       // Your application's short_name. `string`. Optional. If not set, appName will be used
  appDescription: "AI-Powered Learning Platform", // Your application's description. `string`
  developerName: "Synergies4 LLC",          // Your (or your developer's) name. `string`
  developerURL: "https://synergies4.com",  // Your (or your developer's) URL. `string`
  dir: "auto",                              // Primary text direction for name, short_name, and description
  lang: "en-US",                            // Primary language for name and short_name
  background: "#fff",                       // Background colour for flattened icons. `string`
  theme_color: "#4b1aff",                   // Theme color user for example in Android's task switcher. `string`
  appleStatusBarStyle: "black-translucent", // Style for Apple status bar: "black-translucent", "default", "black". `string`
  display: "standalone",                    // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
  orientation: "any",                       // Default orientation: "any", "natural", "portrait" or "landscape". `string`
  scope: "/",                               // set of URLs that the browser considers within your app
  start_url: "/",                           // Start URL when launching the application from a device. `string`
  version: "1.0",                           // Your application's version string. `string`
  logging: false,                           // Print logs to console? `boolean`
  pixel_art: false,                         // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
  loadManifestWithCredentials: false,       // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
  icons: {
    // Platform Options:
    // - offset - offset in percentage
    // - background:
    //   * false - use default
    //   * true - force use default, e.g. set background for Android icons
    //   * color - set background for the specified icons
    //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
    //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
    //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
    //
    android: true,              // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    appleStartup: false,        // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    coast: false,               // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    favicons: true,             // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    firefox: false,             // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    windows: false,             // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
    yandex: false               // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }` or an array of sources
  }
};

async function generateFavicons() {
  try {
    console.log('🎨 Generating favicons from', source);
    
    const response = await favicons(source, configuration);
    
    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write images
    response.images.forEach((image) => {
      const imagePath = path.join(publicDir, image.name);
      fs.writeFileSync(imagePath, image.contents);
      console.log('✅ Created:', image.name);
    });
    
    // Write files (like manifest.json, browserconfig.xml)
    response.files.forEach((file) => {
      const filePath = path.join(publicDir, file.name);
      fs.writeFileSync(filePath, file.contents);
      console.log('✅ Created:', file.name);
    });
    
    console.log('🎉 Favicon generation complete!');
    console.log('📝 HTML to add to your <head>:');
    console.log(response.html.join('\n'));
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

generateFavicons(); 