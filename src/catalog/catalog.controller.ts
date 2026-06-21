import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogItem, CreateCatalogItemDto } from './catalog.types';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  findAll(): CatalogItem[] {
    return this.catalogService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): CatalogItem {
    return this.catalogService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCatalogItemDto): CatalogItem {
    return this.catalogService.create(dto);
  }
}
