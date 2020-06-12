/**
 * Generic express message response
 *
 * @param {Express.Response} res
 * @param {number} status
 * @param {string} message
 * @param {boolean} error
 */
export default function (
  res: Express.Response,
  status = 401,
  message = 'Resource not found',
  error = true
) {
  return !error
    ? res.status(status).json({ message })
    : res.status(status).json({ error: message });
}
