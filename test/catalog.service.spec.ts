import { NotFoundException } from '@nestjs/common';
import { CatalogService } from '../src/catalog/catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(() => {
    service = new CatalogService();
  });

  it('should list default catalog items', () => {
    const items = service.findAll();

    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]).toHaveProperty('id');
    expect(items[0]).toHaveProperty('name');
  });

  it('should find an item by id', () => {
    const [firstItem] = service.findAll();

    const result = service.findById(firstItem.id);

    expect(result.id).toBe(firstItem.id);
  });

  it('should throw not found when item does not exist', () => {
    expect(() => service.findById('invalid-id')).toThrow(NotFoundException);
  });

  it('should create a new item', () => {
    const item = service.create({
      name: 'Gelato de mora',
      price: 9800,
      description: 'Producto creado en prueba unitaria.',
    });

    expect(item.id).toContain('gelato-de-mora');
    expect(item.available).toBe(true);
    expect(service.findAll()).toContainEqual(item);
  });
});
