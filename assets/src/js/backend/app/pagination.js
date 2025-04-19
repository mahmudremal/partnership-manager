import React, { useState } from 'react';

const Pagination = ({ totalPages, currentPage, handlePageChange }) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        handlePageChange(page);
      }
      setIsInputVisible(false);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 10;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = 1;
      let endPage = totalPages;

      if (currentPage <= 6) {
        startPage = 1;
        endPage = 6;
      } else if (currentPage + 3 >= totalPages) {
        startPage = totalPages - 8;
        endPage = totalPages;
      } else {
        startPage = currentPage - 3;
        endPage = currentPage + 3;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (startPage > 2) {
        pages.unshift('...');
        pages.unshift(1);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`xpo_flex xpo_justify-center xpo_mt-6 ${totalPages === 1 && 'xpo_hidden'}`}>
      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            isInputVisible ? (
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="xpo_mx-1 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_border xpo_border-gray-300"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsInputVisible(true)}
                className="xpo_mx-1 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_bg-primary-500 xpo_text-white hover:xpo_bg-primary-700"
              >
                ...
              </button>
            )
          ) : (
            <button
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
              className={`xpo_mx-1 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_bg-primary-500 xpo_text-white hover:xpo_bg-primary-700 ${page === currentPage ? 'xpo_bg-gray-500 xpo_cursor-not-allowed' : ''}`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Pagination;
