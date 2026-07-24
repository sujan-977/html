import "./globals.css";

export const metadata = {
  title: "Atithi Restro & Lodge",
  description: "Welcome to Atithi Restro & Lodge - Delicious Food and Cozy Rooms",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&family=Fraunces:opsz,wght@9..144,400..700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
