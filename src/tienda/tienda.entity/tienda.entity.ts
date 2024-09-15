import { ProductoEntity } from '../../producto/producto.entity/producto.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TiendaEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    nombre: string;

    @Column()
    ciudad: string;

    @ManyToMany(() => ProductoEntity, (producto) => producto.tiendas)
    @JoinTable()
    productos: ProductoEntity[]
}
