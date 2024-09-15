import { TiendaEntity } from 'src/tienda/tienda.entity/tienda.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductoEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    nombre: string;

    @Column()
    precio: number;

    @Column()
    tipo: string;

    @ManyToMany(() => TiendaEntity, (tienda) => tienda.productos)
    tiendas: TiendaEntity[]

}
