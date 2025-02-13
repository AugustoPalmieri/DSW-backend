import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth";

jest.mock("jsonwebtoken"); // Mock de jwt

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("debe retornar 401 si no se proporciona el token", () => {
    // Simular que no se proporciona el header "Authorization"
    mockRequest.header = jest.fn().mockReturnValue(undefined);

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Acceso denegado. Token no proporcionado.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("debe retornar 400 si el token es inválido", () => {
    const invalidToken = "invalid.token";
    mockRequest.header = jest.fn().mockReturnValue(`Bearer ${invalidToken}`);

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Token inválido." });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("debe llamar a next() si el token es válido", () => {
    const validToken = "valid.token";
    const mockDecoded = { id: 1, name: "Test User" };
    mockRequest.header = jest.fn().mockReturnValue(`Bearer ${validToken}`);

    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

    authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET!);
    expect((mockRequest as any).user).toEqual(mockDecoded);
    expect(mockNext).toHaveBeenCalled();
  });
});
