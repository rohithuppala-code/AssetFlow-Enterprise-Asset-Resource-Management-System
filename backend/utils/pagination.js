/**
 * Build pagination metadata from query params.
 *
 * @param {object} query      - Express req.query
 * @param {number} totalDocs  - Total matching documents count
 * @returns {{ page, limit, skip, pagination }}
 */
const buildPagination = (query, totalDocs) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const pages = Math.ceil(totalDocs / limit);

  return {
    page,
    limit,
    skip,
    pagination: {
      page,
      limit,
      total: totalDocs,
      pages,
    },
  };
};

module.exports = { buildPagination };
