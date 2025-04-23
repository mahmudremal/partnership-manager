import React, { useEffect } from 'react';

const LoadStyles = () => {
  useEffect(() => {
    const stylesheets = [
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/remixicon.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/bootstrap.min.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/apexcharts.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/dataTables.min.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/editor-katex.min.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/editor.atom-one-dark.min.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/editor.quill.snow.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/flatpickr.min.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/full-calendar.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/jquery-jvectormap-2.0.5.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/magnific-popup.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/slick.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/prism.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/file-upload.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/lib/audioplayer.css",
      "https://wowdash.wowtheme7.com/bundlelive/demo/assets/css/style.css"
    ];

    stylesheets.forEach((stylesheet) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = stylesheet;
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
