import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BotService } from './bot.service';
import { Bot } from '../models';

describe('BotService', () => {
  let service: BotService;
  let httpMock: HttpTestingController;

  const mockBot: Bot = {
    id: 1,
    name: 'TestBot',
    uuid: 'test-uuid-123',
    status: 'ACTIVE',
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    universeId: 1,
    universe: {
      id: 1,
      name: 'Test Universe',
      url: 'https://test.ogame.org',
      discordWebhook: 'https://discord.com/webhook',
      createdAt: new Date().toISOString()
    }
  };

  const mockBots: Bot[] = [
    mockBot,
    {
      id: 2,
      name: 'TestBot2',
      uuid: 'test-uuid-456',
      status: 'INACTIVE',
      lastSeenAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      createdAt: new Date().toISOString(),
      universeId: 1,
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
    it('should retrieve all bots', () => {
      service.getBots().subscribe(bots => {
        expect(bots).toEqual(mockBots);
        expect(bots.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/bots');
      expect(req.request.method).toBe('GET');
      req.flush(mockBots);
    });

    it('should handle empty bot list', () => {
      service.getBots().subscribe(bots => {
        expect(bots).toEqual([]);
        expect(bots.length).toBe(0);
      });

      const req = httpMock.expectOne('/api/bots');
      req.flush([]);
    });

    it('should handle error when retrieving bots', () => {
      service.getBots().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/bots');
      req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getBot', () => {
    it('should retrieve a single bot by id', () => {
      const botId = 1;

      service.getBot(botId).subscribe(bot => {
        expect(bot).toEqual(mockBot);
      });

      const req = httpMock.expectOne(`/api/bots/${botId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBot);
    });

    it('should handle bot not found error', () => {
      const botId = 999;

      service.getBot(botId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`/api/bots/${botId}`);
      req.flush({ error: 'Bot not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateBotStatus', () => {
    it('should update bot status to active', () => {
      const botId = 1;
      const updatedBot = { ...mockBot, status: 'ACTIVE' as const, lastSeenAt: new Date().toISOString() };

      service.updateBotStatus(botId, 'ACTIVE').subscribe(bot => {
        expect(bot).toEqual(updatedBot);
        expect(bot.status).toBe('ACTIVE');
      });

      const req = httpMock.expectOne(`/api/bots/${botId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'ACTIVE' });
      req.flush(updatedBot);
    });

    it('should update bot status to inactive', () => {
      const botId = 1;
      const updatedBot = { ...mockBot, status: 'INACTIVE' as const };

      service.updateBotStatus(botId, 'INACTIVE').subscribe(bot => {
        expect(bot).toEqual(updatedBot);
        expect(bot.status).toBe('INACTIVE');
      });

      const req = httpMock.expectOne(`/api/bots/${botId}/status`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status: 'INACTIVE' });
      req.flush(updatedBot);
    });
  });

  describe('deleteBolt', () => {
    it('should delete a bot', () => {
      const botId = 1;

      service.deleteBot(botId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`/api/bots/${botId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle delete error', () => {
      const botId = 1;

      service.deleteBot(botId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`/api/bots/${botId}`);
      req.flush({ error: 'Cannot delete active bot' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getBotsByUniverse', () => {
    it('should retrieve bots for a specific universe', () => {
      const universeId = 1;
      const universeBots = mockBots.filter(bot => bot.universeId === universeId);

      service.getBotsByUniverse(universeId).subscribe(bots => {
        expect(bots).toEqual(universeBots);
        expect(bots.every(bot => bot.universeId === universeId)).toBe(true);
      });

      const req = httpMock.expectOne(`/api/bots?universeId=${universeId}`);
      expect(req.request.method).toBe('GET');
      req.flush(universeBots);
    });

    it('should handle empty result for universe', () => {
      const universeId = 999;

      service.getBotsByUniverse(universeId).subscribe(bots => {
        expect(bots).toEqual([]);
      });

      const req = httpMock.expectOne(`/api/bots?universeId=${universeId}`);
      req.flush([]);
    });
  });

  describe('bot statistics', () => {
    it('should calculate bot statistics correctly', () => {
      // This would be a method on the component, but we can test the logic here
      const activeBots = mockBots.filter(bot => bot.status === 'ACTIVE');
      const inactiveBots = mockBots.filter(bot => bot.status === 'INACTIVE');
      
      expect(activeBots.length).toBe(1);
      expect(inactiveBots.length).toBe(1);
      expect(mockBots.length).toBe(2);
    });

    it('should identify recently active bots', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentlyActiveBots = mockBots.filter(bot => 
        bot.status === 'ACTIVE' && new Date(bot.lastSeenAt) > tenMinutesAgo
      );
      
      expect(recentlyActiveBots.length).toBe(1);
      expect(recentlyActiveBots[0].id).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      service.getBots().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('/api/bots');
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle authorization errors', () => {
      service.getBots().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne('/api/bots');
      req.flush({ error: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });
  });
});
