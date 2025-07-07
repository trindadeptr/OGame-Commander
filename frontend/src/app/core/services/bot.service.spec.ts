import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BotService } from './bot.service';
import { Bot } from '../models';

describe('BotService', () => {
  let service: BotService;
  let httpMock: HttpTestingController;

  const mockBot: Bot = {
    id: 1,
    uuid: 'test-uuid-123',
    name: 'Test Bot',
    status: 'ACTIVE',
    lastSeenAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    universe: {
      id: 1,
      name: 'Test Universe',
      url: 'https://test-universe.com',
      discordWebhook: 'https://discord.com/webhook',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }
  };

  const mockBots: Bot[] = [
    mockBot,
    {
      id: 2,
      uuid: 'test-uuid-456',
      name: 'Test Bot 2',
      status: 'INACTIVE',
      lastSeenAt: '2023-01-02T00:00:00Z',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      universe: mockBot.universe
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BotService]
    });
    service = TestBed.inject(BotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBots', () => {
    it('should get all bots', () => {
      service.getBots().subscribe(bots => {
        expect(bots).toEqual(mockBots);
        expect(bots.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/bots');
      expect(req.request.method).toBe('GET');
      req.flush(mockBots);
    });

    it('should handle getBots error', () => {
      const errorResponse = { status: 500, statusText: 'Server Error' };

      service.getBots().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/bots');
      req.flush('Server Error', errorResponse);
    });
  });

  describe('getBot', () => {
    it('should get bot by id', () => {
      const botId = 1;

      service.getBot(botId).subscribe(bot => {
        expect(bot).toEqual(mockBot);
      });

      const req = httpMock.expectOne(`/api/bots/${botId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBot);
    });

    it('should handle getBot error', () => {
      const botId = 999;
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getBot(botId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/bots/${botId}`);
      req.flush('Not Found', errorResponse);
    });
  });
});
