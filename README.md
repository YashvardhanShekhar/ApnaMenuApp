# ApnaMenu 🍽️

![ApnaMenu Logo](./android/app/src/main/res/mipmap-hdpi/ic_launcher_adaptive_fore.png)

ApnaMenu is a React Native mobile app that simplifies menu management for restaurants. With **voice commands**, **photo uploads**, and now a **smart chatbot**, restaurant owners can update menus in real-time, while customers enjoy a seamless ordering experience. Powered by Firebase and Google Gemini API, ApnaMenu is designed for small businesses looking to modernize their operations.

## 🚀 Features
- **Smart Chatbot (Chotu)**: Manage menu items via natural language (e.g., “Delete snacks under ₹90”).
- **Voice Commands**: Update menus by speaking (e.g., “Add Chole Bhature for ₹100”).
- **Photo Menu Upload**: Extract menu items from photos using OCR.
- **Intuitive Menu Browsing**: Navigate categorized menus effortlessly.
- **Real-Time Menu Management**: Add, edit, or mark items unavailable instantly.
- **User Authentication**: Secure Google Sign-In with Firebase.
- **Responsive Design**: Optimized for all screen sizes.

## 🛠️ Technologies Used
- **React Native**: Cross-platform mobile app development.
- **Redux**: State management.
- **Firebase**: Authentication and real-time database.
- **Google Gemini API**: Voice-to-text, image processing, and chatbot functionality.
- **React Navigation**: In-app navigation.

## 🧑‍💻 Getting Started

### Prerequisites
- Node.js and npm
- React Native CLI
- Android Studio or Xcode
- Firebase and Google Gemini API accounts

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YashvardhanShekhar/ApnaMenuApp.git
   cd ApnaMenuApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Firebase and Gemini API:
   - Add Firebase config to `src/utils/firebaseConfig.js`.
   - Add Gemini API key to .env.
4. Start the development server:
   ```bash
   npm start
   ```
5. Run the app:
   - Android: `npx react-native run-android`
   - iOS: `npx react-native run-ios`

## 📂 Project Structure
```
ApnaMenuApp/
├── android/
├── ios/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   └── services/
├── package.json
└── README.md
```

## 📅 Roadmap
- QR-code-based customer website for live menu access.
- Multi-language support for the chatbot and voice commands.
- In-app payment integration.

## 🤝 Contributing
1. Fork the repository.
2. Create a branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a pull request.

---

## 📬 Contact
For inquiries, reach out to [Yashvardhan Shekhar](https://www.linkedin.com/in/yashvardhanshekhar/).

---

![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=white)
```
