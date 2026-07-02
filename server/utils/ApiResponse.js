// server/utils/ApiResponse.js
// Provides consistent JSON response structure across all endpoints.
// Every API response follows: { success, message, data, meta }

export class ApiResponse {
  // 200 OK — successful request with data
  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  // 201 Created — resource created successfully
  static created(res, message = 'Created successfully', data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  // Paginated list response
  static paginated(res, message = 'Success', data = [], pagination = {}) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total || 0,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      },
    });
  }

  // Error response
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }
}