export class EmailInUseError extends Error {
  constructor(message = 'User with provided email already exists') {
    super(message);
    Object.setPrototypeOf(this, EmailInUseError.prototype);
  }
}
