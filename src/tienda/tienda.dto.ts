import { IsNotEmpty, IsString } from "class-validator";

export class TiendaDto {

    @IsNotEmpty()
    @IsString()
    readonly nombre: string

    @IsNotEmpty()
    @IsString()
    readonly ciudad: string
}
