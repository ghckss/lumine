export type BridgeErrorCode =
  | "TIMEOUT"
  | "UNKNOWN_COMMAND"
  | "INVALID_PARAMS"
  | "POLICY_VIOLATION"
  | "INTERNAL_ERROR";

export type BridgeRequest = {
  requestId: string;
  command: string;
  params?: Record<string, unknown>;
};

export type BridgeResponse<T = unknown> = {
  requestId: string;
  ok: boolean;
  data?: T;
  error?: {
    code: BridgeErrorCode;
    message: string;
  };
};

export type NativeBridgeEnvelope =
  | {
      type: "webToApp";
      payload: BridgeRequest;
    }
  | {
      type: "bridgeResponse";
      payload: BridgeResponse;
    }
  | {
      type: "appToWeb";
      payload: BridgeRequest;
    };
