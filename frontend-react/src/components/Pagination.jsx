import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";

export default function MyPagination({ data = [], itemsPerPage = 10, onPageDataChange, onPageChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(startIndex, startIndex + itemsPerPage);
    onPageDataChange(pageData);
    onPageChange(currentPage);
  }, [data, currentPage, itemsPerPage, onPageDataChange, onPageChange]);

  if (totalPages <= 1) return null;

  const handleClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <Pagination.Item key={i} active={i === currentPage} onClick={() => handleClick(i)}>
        {i}
      </Pagination.Item>
    );
  }

  return (
    <Pagination>
      <Pagination.Prev disabled={currentPage === 1} onClick={() => handleClick(currentPage - 1)} />
      {pages}
      <Pagination.Next disabled={currentPage === totalPages} onClick={() => handleClick(currentPage + 1)} />
    </Pagination>
  );
}
