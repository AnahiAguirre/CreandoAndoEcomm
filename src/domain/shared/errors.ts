/**
 * Base for errors the UI is expected to handle (show a message, not a 500).
 * Anything else thrown from the domain is a bug or an infra failure.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
