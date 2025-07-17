import React, { useEffect } from 'react';

const LoadStyles = () => {
  useEffect(() => {
    const lib_url = (file) => {
      return `https://${location.host}/wp-content/plugins/partnership-manager/dist/library/css/${file}`;
    }
    const stylesheets = [
      "remixicon.css",
      "bootstrap.min.css",
      "apexcharts.css",
      "dataTables.min.css",
      "editor-katex.min.css",
      "editor.atom-one-dark.min.css",
      "editor.quill.snow.css",
      "flatpickr.min.css",
      "full-calendar.css",
      "jquery-jvectormap-2.0.5.css",
      "magnific-popup.css",
      "slick.css",
      "prism.css",
      "file-upload.css",
      "audioplayer.css",
      "style.css",
    ];

    stylesheets.forEach((stylesheet) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = lib_url(stylesheet);
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    });

    const scripts = [];
    
    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    });
  }, []);  // Empty dependency array ensures this runs only once

  return null; // No need to render anything
};

export default LoadStyles;
