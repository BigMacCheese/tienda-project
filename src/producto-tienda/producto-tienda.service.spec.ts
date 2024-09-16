import { Test, TestingModule } from '@nestjs/testing';
import { ProductoTiendaService } from './producto-tienda.service';
import { Repository } from 'typeorm';
import { TiendaEntity } from '../tienda/tienda.entity/tienda.entity';
import { ProductoEntity } from '../producto/producto.entity/producto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker/.';

describe('ProductoTiendaService', () => {

  let service: ProductoTiendaService;
  let tiendaRepository: Repository<TiendaEntity>
  let productoRepository: Repository<ProductoEntity>
  let producto: ProductoEntity
  let tiendasList: TiendaEntity[]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity))
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity))

    await seedDatabase();
  });

  const seedDatabase = async () => {
    productoRepository.clear();
    tiendaRepository.clear();

    tiendasList = [];
    for (let i = 0; i < 5; i++) {
      const tienda: TiendaEntity = await tiendaRepository.save({
        nombre: faker.commerce.product(),
        ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
      });
      tiendasList.push(tienda);
    }

    producto = await productoRepository.save({
      nombre: faker.commerce.product(),
      precio: parseInt(faker.commerce.price()),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No Perecedero']),
      tiendas: tiendasList
    });
  }

  it('addTiendaToProducto deberia añadir una tienda a un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
    });

    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.commerce.product(),
      precio: parseInt(faker.commerce.price()),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No Perecedero'])
    });

    const result: ProductoEntity = await service.addTiendaToProducto(newTienda.id, newProducto.id);

    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad);
  });

  it('addTiendaToProducto deberia lanzar una excepcion para un producto invalido', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
    });

    await expect(() => service.addTiendaToProducto(newTienda.id, "0")).rejects.toHaveProperty("message", "El producto con el id dado no existe");
  });

  it('addTiendaToProducto deberia lanzar una excepcion para una tienda invalida', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: faker.commerce.product(),
      precio: parseInt(faker.commerce.price()),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No Perecedero'])
    });

    await expect(() => service.addTiendaToProducto("0", newProducto.id)).rejects.toHaveProperty("message", "La tienda con el id dado no existe");
  });

  it('findTiendasFromProducto deberias retornar las tiendas de un producto', async () => {
    const tiendas: TiendaEntity[] = await service.findTiendasFromProducto(producto.id);
    expect(tiendas.length).toBe(5);
  });

  it('findTiendasFromProducto deberia lanzar una excepcion para un producto invalido', async () => {
    await expect(() => service.findTiendasFromProducto("0")).rejects.toHaveProperty("message", "El producto con el id dado no existe");
  });

  it('findTiendaFromProducto deberia retornar una tienda de un producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    const storedTienda: TiendaEntity = await service.findTiendaFromProducto(tienda.id, producto.id);
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toBe(tienda.nombre);
    expect(storedTienda.ciudad).toBe(tienda.ciudad);
  });

  it('findTiendaFromProducto deberia lanzar una excpecion para una tienda invalida', async () => {
    await expect(() => service.findTiendaFromProducto("0", producto.id)).rejects.toHaveProperty("message", "La tienda con el id dado no existe");
  });

  it('findTiendaFromProducto deberia lanzar una excepcion para un producto invalido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(() => service.findTiendaFromProducto(tienda.id, "0")).rejects.toHaveProperty("message", "El producto con el id dado no existe");
  });

  it('findTiendaFromProducto deberia lanzar una excepcion por una tienda que no esta asociada al producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
    });

    await expect(() => service.findTiendaFromProducto(newTienda.id, producto.id)).rejects.toHaveProperty("message", "La tienda con el id dado no esta asociado al producto");
  });

  it('updateTiendasFromProducto deberia actualizar las tiendas de un producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
    });

    const updatedProducto: ProductoEntity = await service.updateTiendasFromProducto(producto.id, [newTienda]);
    expect(updatedProducto.tiendas.length).toBe(1);
    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
  });

  it('updateTiendasFromProducto deberia lanzar una excepcion para un producto invalido', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
    });

    await expect(() => service.updateTiendasFromProducto("0", [newTienda])).rejects.toHaveProperty("message", "El producto con el id dado no existe");
  });

  it('updateTiendasFromProducto deberia lanzar una excepcion para una tienda invalida', async () => {
    const newTienda: TiendaEntity = tiendasList[0];
    newTienda.id = "0";

    await expect(() => service.updateTiendasFromProducto(producto.id, [newTienda])).rejects.toHaveProperty("message", "La tienda con el id dado no existe");
  });

  it('deleteTiendaFromProducto deberia eliminar una tienda de un producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];

    await service.deleteTiendaFromProducto(producto.id, tienda.id);

    const storedProducto: ProductoEntity = await productoRepository.findOne({where: {id: producto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = storedProducto.tiendas.find(c => c.id === tienda.id);

    expect(deletedTienda).toBeUndefined();
  });

  it('deleteTiendaFromProducto deberia lanzar una excepcion para una tienda invalida', async () => {
    await expect(() => service.deleteTiendaFromProducto(producto.id, "0")).rejects.toHaveProperty("message", "La tienda con el id dado no existe");
  });

  it('deleteTiendaFromProducto deberia lanzar una excpecion para un producto invalido', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(() => service.deleteTiendaFromProducto("0", tienda.id)).rejects.toHaveProperty("message", "El producto con el id dado no existe");
  });

  it('deleteTiendaFromProducto deberia lanzar una excepcion para una tienda no asociada al producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.commerce.product(),
      ciudad: faker.helpers.arrayElement(['SMR', 'BOG', 'MED'])
    });

    await expect(() => service.deleteTiendaFromProducto(producto.id, newTienda.id)).rejects.toHaveProperty("message", "La tienda con el id dado no esta asociado al producto");
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
