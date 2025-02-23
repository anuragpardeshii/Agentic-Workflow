import React from "react";

const Footer = () => {
  return (
    <footer className="relative border-t border-purple-500/20 py-6 px-4">
      <div className="max-w-7xl mx-auto container flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <img src="/ai.png" alt="AI Logo" className="w-6 h-6" />
          <span className="font-bold text-white">Buildfast.ai</span>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
          <a
            href="https://stackblitz.com/terms-of-service"
            className="text-purple-200 hover:text-white transition-colors"
          >
            Terms
          </a>
          <a
            href="https://stackblitz.com/privacy-policy"
            className="text-purple-200 hover:text-white transition-colors"
          >
            Privacy
          </a>
          <a
            href="/contact"
            className="text-purple-200 hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
