import websocketService, { Subscription } from '../src/services/websocket-service';

describe('websocketService tests', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onopen: jest.fn(),
      onmessage: jest.fn(),
      onclose: jest.fn(),
      onerror: jest.fn(), 
    };

    global.WebSocket = jest.fn(() => mockWebSocket) as any;
    websocketService['connection'] = mockWebSocket;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ***** TESTS ***** ///

  test('subscribe() should add a subscription to the subscriptions set', () => {
    const subscription = websocketService.subscribe();

    expect(subscription).toBeInstanceOf(Subscription); // Sørg for at det er en Subscription
    expect(websocketService['subscriptions'].has(subscription)).toBe(true); // Sørg for at den legges til i settet
  });

  test('unsubscribe() should remove a subscription from the subscriptions set', () => {
    const subscription = websocketService.subscribe();
    expect(websocketService['subscriptions'].has(subscription)).toBe(true); // Bekreft at Subscription er lagt til

    websocketService.unsubscribe(subscription);

    expect(websocketService['subscriptions'].has(subscription)).toBe(false);
  });

  test('send() should call WebSocket.send() when connection is open', () => {
    mockWebSocket.readyState = WebSocket.OPEN; // Sett tilkoblingen som åpen
    websocketService['connection'] = mockWebSocket; // Sikre at websocketService bruker mocken
    const testMessage = { type: 'test', payload: 'data' };

    websocketService.send(testMessage);

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
  });
});