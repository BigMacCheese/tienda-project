import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';
import { Repository } from 'typeorm';
import { ProductoEntity } from './producto.entity/producto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>
  let productosList: ProductoEntity[] 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear()
    productosList = [];

    for(let i=0; i<5; i++){
      const producto: ProductoEntity = await repository.save({
        nombre: faker.commerce.product(),
        precio: parseInt(faker.commerce.price()),
        tipo: faker.helpers.arrayElement(['Perecedero', 'No Perecedero'])})
      productosList.push(producto)
    }
  }

  it('findAll deberia retornar todos los productos', async () => {
    const productos: ProductoEntity[] = await service.findAll();
    expect(productos).not.toBeNull();
    expect(productos).toHaveLength(productosList.length);
  });

  it('findOne deberia retornar un producto por su id', async () => {
    const storedProducto: ProductoEntity = productosList[0];
    const producto: ProductoEntity = await service.findOne(storedProducto.id);
    expect(producto).not.toBeNull();
    expect(producto.nombre).toEqual(storedProducto.nombre)
    expect(producto.precio).toEqual(storedProducto.precio)
    expect(producto.tipo).toEqual(storedProducto.tipo)
  });

  it('findOne deberia lanzar una excepcion para un producto invalido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "El producto con el id dado no existe")
  });

  it('create deberia retornar un nuevo producto', async () => {
    const producto: ProductoEntity = {
      id: "",
      nombre: faker.commerce.product(),
      precio: parseInt(faker.commerce.price()),
      tipo: faker.helpers.arrayElement(['Perecedero', 'No Perecedero']),
      tiendas: null
    }
 
    const newProducto: ProductoEntity = await service.create(producto);
    expect(newProducto).not.toBeNull();
 
    const storedProducto: ProductoEntity = await repository.findOne({where: {id: newProducto.id}})
    expect(storedProducto).not.toBeNull();
    expect(storedProducto.nombre).toEqual(newProducto.nombre)
    expect(storedProducto.precio).toEqual(newProducto.precio)
    expect(storedProducto.tipo).toEqual(newProducto.tipo)
  });

  it('create deberia lanzar una excepcion para un producto invalido', async () => {
    const producto: ProductoEntity = {
      id: "",
      nombre: faker.commerce.product(),
      precio: parseFloat(faker.commerce.price()),
      tipo: "Otro tipo",
      tiendas: null
    }
    await expect(() => service.create(producto)).rejects.toHaveProperty("message", "El tipo del producto no es el esperado")
  });

  it('update deberia modificar un producto', async () => {
    const producto: ProductoEntity = productosList[0];
    producto.nombre = "Nuevo nombre";
    producto.precio = 5000;
    producto.tipo = 'Perecedero'

    const updatedProducto: ProductoEntity = await service.update(producto.id, producto);
    expect(updatedProducto).not.toBeNull();

    const storedProducto: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(storedProducto).not.toBeNull();
    expect(storedProducto.nombre).toEqual(producto.nombre)
    expect(storedProducto.precio).toEqual(producto.precio)
    expect(storedProducto.tipo).toEqual(producto.tipo)
  });

  it('update deberia lanzar una excepcion para un producto invalido', async () => {
    const producto: ProductoEntity = productosList[0];
    producto.nombre = "Nuevo nombre";
    producto.precio = 5000;
    producto.tipo = 'Otro tipo'
    
    await expect(() => service.update(producto.id, producto)).rejects.toHaveProperty("message", "El tipo del producto no es el esperado")
  });

  it('delete deberia eliminar un producto', async () => {
    const producto: ProductoEntity = productosList[0];
    await service.delete(producto.id);
    const deletedProducto: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(deletedProducto).toBeNull();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
