export class EmailInUseError extends Error {
  constructor(message = 'User with provided email already exists') {
    super(message);
    Object.setPrototypeOf(this, EmailInUseError.prototype);
  }
}

export class ChannelWithProvidedNameExistError extends Error {
  constructor(message = 'Channel with provided name already exists') {
    super(message);
    Object.setPrototypeOf(this, ChannelWithProvidedNameExistError.prototype);
  }
}
