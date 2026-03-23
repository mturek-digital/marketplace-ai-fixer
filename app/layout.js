import "./globals.css";

export const metadata = {
  title: "Marketplace AI Fixer",
  description: "Marketplace data cleaner powered by OpenAI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}