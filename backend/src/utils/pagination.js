export function paginate({ page = 1, limit = 20 }) {
  const pg = Math.max(1, parseInt(page));
  const lim = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    skip: (pg - 1) * lim,
    take: lim,
    page: pg,
    limit: lim,
  };
}

export function paginatedResponse(data, total, { page, limit }) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
