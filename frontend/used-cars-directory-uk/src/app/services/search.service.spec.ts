import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService]
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set search results', () => {
    const mockResults = [{ id: 1, name: 'Test Car' }];
    service.setSearchResults(mockResults);
    expect(service.getSearchResults()).toEqual(mockResults);
  });

  it('should get search results', () => {
    const mockResults = [{ id: 1, name: 'Test Car' }];
    service.setSearchResults(mockResults);
    const results = service.getSearchResults();
    expect(results).toEqual(mockResults);
  });
});