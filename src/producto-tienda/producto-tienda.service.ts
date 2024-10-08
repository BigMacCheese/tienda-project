import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity/producto.entity';
import { Repository } from 'typeorm';
import { TiendaEntity } from '../tienda/tienda.entity/tienda.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

@Injectable()
export class ProductoTiendaService {

    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productoRepository: Repository<ProductoEntity>,
    
        @InjectRepository(TiendaEntity)
        private readonly tiendaRepository: Repository<TiendaEntity>
    ) {}

    async addTiendaToProducto(tiendaId: string, productoId: string): Promise<ProductoEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
        if (!tienda)
          throw new BusinessLogicException("La tienda con el id dado no existe", BusinessError.NOT_FOUND);
      
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]})
        if (!producto)
          throw new BusinessLogicException("El producto con el id dado no existe", BusinessError.NOT_FOUND);
    
        producto.tiendas = [...producto.tiendas, tienda];
        return await this.productoRepository.save(producto);
      }
    
    async findTiendasFromProducto(productoId: string): Promise<TiendaEntity[]>{
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]});
        if (!producto)
          throw new BusinessLogicException("El producto con el id dado no existe", BusinessError.NOT_FOUND)
        
        return producto.tiendas;
    }

    async findTiendaFromProducto(tiendaId: string, productoId: string): Promise<TiendaEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
        if (!tienda)
          throw new BusinessLogicException("La tienda con el id dado no existe", BusinessError.NOT_FOUND)
        
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]}); 
        if (!producto)
          throw new BusinessLogicException("El producto con el id dado no existe", BusinessError.NOT_FOUND)
    
        const productoTienda: TiendaEntity = producto.tiendas.find(e => e.id === tienda.id);
    
        if (!productoTienda)
          throw new BusinessLogicException("La tienda con el id dado no esta asociado al producto", BusinessError.PRECONDITION_FAILED)
    
        return productoTienda;
    }

    async updateTiendasFromProducto(productoId: string, tiendas: TiendaEntity[]): Promise<ProductoEntity> {
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]});
     
        if (!producto)
          throw new BusinessLogicException("El producto con el id dado no existe", BusinessError.NOT_FOUND)
     
        for (let i = 0; i < tiendas.length; i++) {
          const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendas[i].id}});
          if (!tienda)
            throw new BusinessLogicException("La tienda con el id dado no existe", BusinessError.NOT_FOUND)
        }
     
        producto.tiendas = tiendas;
        return await this.productoRepository.save(producto);
    }

    async deleteTiendaFromProducto(productoId: string, tiendaId: string){
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
        if (!tienda)
          throw new BusinessLogicException("La tienda con el id dado no existe", BusinessError.NOT_FOUND)
     
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]});
        if (!producto)
          throw new BusinessLogicException("El producto con el id dado no existe", BusinessError.NOT_FOUND)
     
        const productoTienda: TiendaEntity = producto.tiendas.find(e => e.id === tienda.id);
     
        if (!productoTienda)
            throw new BusinessLogicException("La tienda con el id dado no esta asociado al producto", BusinessError.PRECONDITION_FAILED)

        producto.tiendas = producto.tiendas.filter(e => e.id !== tiendaId);
        await this.productoRepository.save(producto);
    }
}
