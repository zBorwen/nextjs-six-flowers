export enum ErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  INVALID_ACTION = 'INVALID_ACTION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ROOM_FULL = 'ROOM_FULL',
  NOT_HOST = 'NOT_HOST',
  GAME_NOT_ACTIVE = 'GAME_NOT_ACTIVE',
  ALREADY_IN_ROOM = 'ALREADY_IN_ROOM',
  INTERRUPTION_ACTIVE = 'INTERRUPTION_ACTIVE',
  NOT_ENOUGH_PLAYERS = 'NOT_ENOUGH_PLAYERS'
}

export class AppError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}
