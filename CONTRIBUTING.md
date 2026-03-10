# Contributing to Burn the Web

Thank you for your interest in contributing to Burn the Web! This document provides guidelines and instructions for contributing to the project.

## 🎯 Ways to Contribute

- **Report Bugs**: Found a bug? Open an issue with details on how to reproduce it
- **Suggest Features**: Have an idea for a new feature? We'd love to hear it!
- **Improve Documentation**: Help make the docs clearer or more comprehensive
- **Submit Code**: Fix bugs, add features, or improve performance
- **Test on Devices**: Try the bookmarklet on different Android devices and report compatibility

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Device Information**: Android version, Chrome version
2. **Steps to Reproduce**: Clear steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happened
5. **Screenshots/Video**: If possible, include visual evidence

## 💡 Suggesting Features

Feature suggestions should include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Have you considered other approaches?
4. **Additional Context**: Any other relevant information

## 🔧 Development Setup

### Prerequisites

- A text editor (VS Code, Sublime Text, etc.)
- A web browser for testing
- Basic knowledge of JavaScript and HTML5 Canvas

### Getting Started

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/burnit.git
   cd burnit
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**
   - Edit `burnit.js` for the main effect logic
   - Edit `index.html` for the landing page
   - Test thoroughly on both desktop and mobile

5. **Test Your Changes**
   - Open `test.html` in a browser to test the effect
   - Test the bookmarklet on various websites
   - Ensure mobile compatibility

## 📝 Code Style Guidelines

### JavaScript

- Use ES6+ features (const, let, arrow functions, classes)
- Follow consistent indentation (2 or 4 spaces)
- Add comments for complex logic
- Use meaningful variable and function names

Example:
```javascript
// Good
const particleCount = 100;
const particles = [];

// Not as good
const pc = 100;
const p = [];
```

### HTML/CSS

- Use semantic HTML5 elements
- Keep CSS organized and commented
- Ensure responsive design for mobile
- Test on different screen sizes

## 🧪 Testing Checklist

Before submitting a pull request, ensure:

- [ ] Code works on desktop Chrome
- [ ] Code works on Android Chrome
- [ ] No console errors
- [ ] Performance is acceptable (30 FPS target)
- [ ] Code is well-commented
- [ ] No breaking changes to existing functionality
- [ ] Bookmarklet code is properly minified

## 📦 Submitting a Pull Request

1. **Update Your Fork**
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

3. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with details

### Pull Request Guidelines

- **Clear Title**: Describe what the PR does
- **Description**: Explain the changes and why they're needed
- **Testing**: Describe how you tested the changes
- **Screenshots**: Include screenshots or videos if relevant
- **Breaking Changes**: Clearly note any breaking changes

## 🎨 Feature Ideas

Here are some ideas for contributions:

### Easy
- Add more color schemes (blue fire, green fire, etc.)
- Add sound effects (optional)
- Improve mobile instructions
- Add more test pages

### Medium
- Add configuration options (speed, intensity, direction)
- Create different burn patterns (center-out, left-to-right)
- Add smoke particles
- Implement different destruction effects (ice, dissolve, etc.)

### Advanced
- Add 3D effects using WebGL
- Implement physics-based interactions
- Create a visual configuration tool
- Add touch gesture support for triggering

## 📄 License

By contributing to Burn the Web, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all:

- **Be Respectful**: Treat everyone with respect
- **Be Constructive**: Provide helpful feedback
- **Be Patient**: Remember that people have different skill levels
- **Be Open**: Welcome newcomers and diverse perspectives

## 📧 Questions?

If you have questions about contributing:

- Open an issue with the "question" label
- Reach out to [@JamesPBurke](https://github.com/JamesPBurke)

---

Thank you for contributing to Burn the Web! 🔥
