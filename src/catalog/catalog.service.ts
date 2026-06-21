import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogItem, CreateCatalogItemDto } from './catalog.types';

@Injectable()
export class CatalogService {
  private readonly items: CatalogItem[] = [
    {
      id: 'gelato-lulo',
      name: 'Gelato de lulo',
      description: 'Producto de ejemplo usado para validar el microservicio.',
      price: 9500,
      available: true,
    },
    {
      id: 'gelato-cafe',
      name: 'Gelato de café',
      description: 'Segundo producto de ejemplo para pruebas de consulta.',
      price: 10500,
      available: true,
    },
  ];

  findAll(): CatalogItem[] {
    return [...this.items];
  }

  findById(id: string): CatalogItem {
    const item = this.items.find((candidate) => candidate.id === id);

    if (!item) {
      throw new NotFoundException(`Catalog item with id ${id} was not found`);
    }

    return item;
  }

  create(dto: CreateCatalogItemDto): CatalogItem {
    const normalizedName = dto.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = `${normalizedName}-${Date.now()}`;

    const item: CatalogItem = {
      id,
      name: dto.name.trim(),
      description: dto.description?.trim() ?? 'Sin descripción',
      price: dto.price,
      available: dto.available ?? true,
    };

    this.items.push(item);
    return item;
  }
}
