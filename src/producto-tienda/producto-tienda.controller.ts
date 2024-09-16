import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { ProductoTiendaService } from './producto-tienda.service';
import { TiendaDto } from '../tienda/tienda.dto';
import { plainToInstance } from 'class-transformer';
import { TiendaEntity } from '../tienda/tienda.entity/tienda.entity';

@Controller('productos')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoTiendaController {
    constructor(private readonly productoTiendaService: ProductoTiendaService){}

    
    @Post(':productoId/tiendas/:tiendaId')
    async addTiendaToProducto(@Param('tiendaId') tiendaId: string, @Param('productoId') productoId: string){
       return await this.productoTiendaService.addTiendaToProducto(tiendaId, productoId);
    }

    @Get(':productoId/tiendas')
    async findTiendasFromProducto(@Param('productoId') productoId: string){
       return await this.productoTiendaService.findTiendasFromProducto(productoId);
    }

    @Get(':productoId/tiendas/:tiendaId')
    async findTiendaFromProducto(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
       return await this.productoTiendaService.findTiendaFromProducto(tiendaId, productoId);
    }

    @Put(':productoId/tiendas')
    async updateTiendasFromProducto(@Body() tiendasDto: TiendaDto[], @Param('productoId') productoId: string){
       const tiendas = plainToInstance(TiendaEntity, tiendasDto)
       return await this.productoTiendaService.updateTiendasFromProducto(productoId, tiendas);
    }

    @Delete(':productoId/tiendas/:tiendaId')
    @HttpCode(204)
    async deleteTiendaFromProducto(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
       return await this.productoTiendaService.deleteTiendaFromProducto(productoId, tiendaId);
    }
}
