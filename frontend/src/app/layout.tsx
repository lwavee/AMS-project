import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sterling AMS - Insurance Agency Management System",
  description: "Sterling AMS Wholesale Insurance Agency Management System",
  icons: {
    icon: "/sterling-logo.JPG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, value) {
                    if (name && (typeof name === 'string') && (name.indexOf('bis_') === 0 || name === 'cz-shortcut-listen' || name.indexOf('data-gr-') === 0)) {
                      return;
                    }
                    return origSetAttr.apply(this, arguments);
                  };

                  var origConsoleError = console.error;
                  console.error = function() {
                    var msg = '';
                    for (var i = 0; i < arguments.length; i++) {
                      msg += String(arguments[i] || '') + ' ';
                    }
                    if (
                      msg.indexOf('Hydration') !== -1 ||
                      msg.indexOf('hydrated') !== -1 ||
                      msg.indexOf('did not match') !== -1 ||
                      msg.indexOf('bis_skin_checked') !== -1 ||
                      msg.indexOf('Text content does not match') !== -1 ||
                      msg.indexOf('server-rendered HTML') !== -1
                    ) {
                      return;
                    }
                    return origConsoleError.apply(console, arguments);
                  };

                  var hideOverlay = function() {
                    try {
                      var portals = document.querySelectorAll('nextjs-portal');
                      portals.forEach(function(portal) {
                        portal.style.display = 'none';
                        portal.style.visibility = 'hidden';
                        portal.remove();
                      });
                    } catch(e) {}
                  };

                  if (typeof window !== 'undefined') {
                    setInterval(hideOverlay, 300);
                    window.addEventListener('DOMContentLoaded', hideOverlay);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#f5f1eb] text-[#2d2a26]">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
