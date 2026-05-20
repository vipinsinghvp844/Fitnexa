import { ApiError } from './api';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  return error instanceof Error ? error.message : fallback;
}

export function getValidationErrors(error: unknown) {
  if (error instanceof ApiError && error.details && typeof error.details === 'object' && 'errors' in error.details) {
    return (error.details as { errors?: Record<string, string[]> }).errors ?? {};
  }

  return {};
}
