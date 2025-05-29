# AR Food Menu Web Application

This web application provides an Augmented Reality (AR) food menu experience for restaurants. Customers can view 3D models of food items through their device's camera, while restaurant owners can manage menu items through an admin panel.

## Features

The AR Food Menu application includes the following features:

### Homepage
The homepage welcomes users with an introduction to the restaurant and provides access to both the AR menu experience and AI-powered food recommendations. The clean, responsive design ensures a great user experience on all devices.

### AR Menu Experience
The AR menu page allows customers to view 3D models of food items using their device's camera. When a customer scans a marker (or QR code), the corresponding 3D model appears in AR, along with the dish name, description, and price.

The AR functionality is implemented using Three.js for 3D rendering, with mindAR.js integration via CDN for marker-based augmented reality. This approach ensures compatibility across modern browsers without requiring any app installation.

### Admin Panel
The admin panel provides a simple interface for restaurant staff to manage the menu. Protected by a password, it allows administrators to:

- Add new food items with names, descriptions, prices, and 3D model URLs
- Edit existing menu items
- Delete menu items
- Generate QR codes for the entire menu or specific items

### QR Code Generation
The QR code generator creates customizable QR codes that link to the AR menu. Administrators can:

- Customize QR code colors and size
- Add custom labels
- Download QR codes as PNG images
- Print QR codes for placement in the restaurant

### AI Recommendation Engine
The AI recommendation engine suggests food items to customers based on:

- Their dietary preferences (vegetarian, vegan, gluten-free, etc.)
- Price range preferences
- Food categories of interest
- Popular items ordered by other customers

This feature enhances the customer experience by helping them discover dishes they might enjoy.

## Technical Implementation

### Frontend
- Built with React.js and TypeScript
- Styled with Tailwind CSS for responsive design
- Uses React Router for navigation

### AR Implementation
- Uses Three.js for 3D rendering
- Integrates mindAR.js via CDN for marker-based AR
- Supports GLB/GLTF 3D models

### State Management
- Uses React's Context API and local storage for state persistence
- Maintains menu items and user preferences between sessions

### QR Code Generation
- Implemented using qrcode.react library
- Supports customization and downloading

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or pnpm package manager

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd ar-food-menu
```

2. Install dependencies:
```
pnpm install
```

3. Start the development server:
```
pnpm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Usage Guide

### For Customers
1. Access the website on a mobile device
2. Navigate to the AR Menu page
3. Allow camera access when prompted
4. Point the camera at a food marker or QR code
5. View the 3D model and information about the dish
6. Use the recommendation engine to discover dishes based on preferences

### For Administrators
1. Access the Admin Panel via the homepage
2. Log in with the password (default: admin123)
3. Manage menu items (add, edit, delete)
4. Generate QR codes for the menu or specific items
5. Customize and download QR codes for printing

## Adding Custom 3D Models

To add your own 3D models:

1. Prepare your 3D models in GLB or GLTF format
2. Host the models on a web server or content delivery network
3. In the Admin Panel, add or edit a menu item
4. Enter the URL to your hosted 3D model in the "3D Model URL" field
5. Save the changes

For optimal performance, ensure your 3D models:
- Are optimized for web (reduced polygon count)
- Have compressed textures
- Are under 5MB in size

## Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the look and feel by modifying:
- The tailwind.config.js file for theme colors and other design tokens
- Component-specific styles in their respective files

### Adding New Features
The modular architecture makes it easy to extend the application:
- Add new components in the src/components directory
- Register new routes in App.tsx
- Extend existing features by modifying their respective component files

## Browser Compatibility

The AR functionality works best on:
- Chrome for Android (version 79+)
- Safari for iOS (version 13+)

Desktop browsers can access the application but may have limited AR functionality.

## Troubleshooting

### AR Not Working
- Ensure you've granted camera permissions
- Check that you're using a compatible browser
- Make sure you have adequate lighting for marker detection
- Verify that the 3D model URLs are accessible

### QR Codes Not Scanning
- Increase the size of printed QR codes
- Ensure adequate contrast between QR code and background
- Use the error correction feature in the QR generator

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Three.js for 3D rendering capabilities
- mindAR.js for augmented reality functionality
- React and Tailwind CSS communities for excellent documentation and resources
