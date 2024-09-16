import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductoEntity } from "../../producto/producto.entity/producto.entity";
import { TiendaEntity } from "../../tienda/tienda.entity/tienda.entity";

export const TypeOrmTestingConfig = () => [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [ProductoEntity, TiendaEntity],
      synchronize: true,
      keepConnectionAlive: true
    }),
    TypeOrmModule.forFeature([TiendaEntity, ProductoEntity]),
];