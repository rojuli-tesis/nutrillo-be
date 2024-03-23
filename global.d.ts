declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      cognitoId: string;
      isAdmin: boolean;
      username: string;
    };
  }
}
