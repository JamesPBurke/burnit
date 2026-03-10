# 🔥 Burn the Web

A mobile-friendly bookmarklet that creates a realistic fire effect, making any webpage appear to catch fire and dissolve before your eyes.

## 🎯 Overview

**Burn the Web** is a JavaScript bookmarklet specifically designed for Google Chrome on Android. Since mobile Chrome doesn't support traditional browser extensions, this solution uses a bookmarklet—a bookmark containing custom JavaScript that can be triggered on any webpage.

## ✨ Features

- **Realistic Fire Animation**: HTML5 Canvas-based particle system with 100+ animated flame particles
- **Page Burn Effect**: Progressive CSS filters that make the page appear to char and dissolve
- **Mobile Optimized**: Frame-rate throttling and efficient rendering for smooth performance on mobile devices
- **Non-Destructive**: Harmless effect that doesn't modify the actual website—just refresh to restore
- **Zero Installation**: No app or extension required—just a bookmark

## 🚀 Quick Start

1. **Visit the Landing Page**: Open [https://jamespburke.github.io/burnit/](https://jamespburke.github.io/burnit/) on your Android Chrome browser
2. **Copy the Code**: Tap the "Copy Bookmarklet Code" button
3. **Create a Bookmark**: 
   - Open Chrome's bookmark menu (⋮ → Bookmarks)
   - Add a new bookmark
   - Name it "Burn It" (or whatever you prefer)
   - Paste the copied code into the URL field
   - Save
4. **Use It**: On any webpage, tap the address bar, type "Burn", and select your bookmark

## 📁 Project Structure

```
burnit/
├── index.html          # Landing page with instructions and copy button
├── burnit.js           # Source code (unminified, well-commented)
└── README.md           # This file
```

## 🛠️ Technical Details

### The Fire Effect

The bookmarklet creates a full-screen HTML5 Canvas overlay with a particle system that renders realistic flames:

- **Particle System**: 100 particles with randomized properties (position, velocity, life, color)
- **Animation Loop**: Uses `requestAnimationFrame` with FPS throttling (30 FPS) for mobile optimization
- **Color Gradients**: HSL-based colors ranging from red (0°) through orange to yellow (60°)
- **Realistic Movement**: Vertical velocity with horizontal drift and wobble

### Page Effects

The DOM is manipulated using CSS filters that progressively transform the page:

1. **Phase 1 (0-40%)**: Heating effect with sepia tone and increased saturation
2. **Phase 2 (40-70%)**: Charring effect with reduced brightness and blur
3. **Phase 3 (70-100%)**: Fade to black with full opacity transition

### Performance Considerations

- **Frame Throttling**: Target 30 FPS instead of 60 FPS to conserve mobile battery
- **Particle Recycling**: Particles are reset and reused instead of creating new objects
- **Canvas Clearing**: Uses a semi-transparent black rectangle for trail effects instead of full clear
- **Cleanup**: Animation stops and canvas is removed after completion to free resources

## 💻 Development

### Modifying the Effect

Edit `burnit.js` to customize the effect:

```javascript
const CONFIG = {
    particleCount: 100,           // More particles = denser fire
    animationDuration: 5000,      // Total duration in milliseconds
    fadeStartDelay: 2000,         // When to start fading the page
    fps: 30                       // Target frames per second
};
```

### Creating the Minified Version

After editing `burnit.js`, minify it for the bookmarklet:

1. Use an online minifier or tool like UglifyJS or Terser
2. Wrap the minified code in `javascript:(function(){ ... })();`
3. Update the `bookmarkletCode` variable in `index.html`

Example using Terser:
```bash
npm install -g terser
terser burnit.js -c -m --toplevel -o burnit.min.js
```

Then wrap it:
```
javascript:(function(){/* paste minified code here */})();
```

## 🧪 Testing

### Desktop Testing

You can test the bookmarklet on desktop Chrome:
1. Create a new bookmark (Ctrl+D or Cmd+D)
2. Edit the bookmark and paste the bookmarklet code in the URL field
3. Navigate to any webpage and click the bookmark

### Mobile Testing

Test on Android Chrome:
1. Follow the installation instructions
2. Try on different websites to ensure compatibility
3. Test performance on various Android device capabilities

## 🔒 Security & Privacy

- **No Data Collection**: The bookmarklet runs entirely in your browser
- **No External Requests**: No data is sent to any server
- **No Persistence**: The effect is temporary and doesn't modify the actual website
- **Open Source**: All code is visible and auditable

## 📝 License

MIT License - Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- GitHub: [@JamesPBurke](https://github.com/JamesPBurke)
- Repository: [https://github.com/JamesPBurke/burnit](https://github.com/JamesPBurke/burnit)

## 🎨 Credits

Created as a demonstration of creative web manipulation using bookmarklets and HTML5 Canvas.

---

**Made with 🔥 for mobile Chrome users**
