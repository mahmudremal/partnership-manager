import React from 'react';

const NoAccess = () => {
  return (
    <div className="xpo_h-full xpo_flex xpo_items-center xpo_justify-center card xpo_py-6 xpo_px-3">
      <div className="xpo_w-full xpo_text-center xpo_flex xpo_flex-col xpo_gap-4">
        <h1 className="xpo_text-xl xpo_font-semibold xpo_text-primary-600 xpo_mb-4">Access Denied</h1>
        <p className="xpo_text-gray-700 xpo_text-base">
          You don't have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default NoAccess;