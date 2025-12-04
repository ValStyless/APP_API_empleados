import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, Req, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleado } from './dto/create-empleado.dto';
import { UpdateEmpleado } from './dto/update-empleado.dto';
import * as express from 'express';
import { CreateRegistroAsistencia } from './dto/create-registro-asistencia.dto';
import { CreateRegistroProduccion } from './dto/create-registro-produccion.dto';

@Controller('empleados')
export class EmpleadosController {
    constructor(private readonly empleadosService: EmpleadosService) {}

    @Post()
    createEmpleado(@Body(new ValidationPipe()) data: CreateEmpleado) {
        return this.empleadosService.createEmpleado(data);
    }

    @Post("create-asistencia")
    asistencia(@Body(new ValidationPipe()) data: CreateRegistroAsistencia) {
        return this.empleadosService.createRegistroAsistencia(data);
    }

    @Post("create-produccion")
    produccion(@Body(new ValidationPipe()) data: CreateRegistroProduccion) {
        return this.empleadosService.createRegistroProduccion(data);
    }

    @Get("asistencia-empleado")
    getAsistencia(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getAsistencia(id_empleado, fechaInicio, fechaFin);
    }

    @Get("nomina")
    getNomina(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getNomina(id_empleado, fechaInicio, fechaFin);
    }

    @Get("dias-trabajados")
    getDiasTrabajados(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getDiasTrabajados(id_empleado, fechaInicio, fechaFin);
    }

    @Get("reporte-asistencia-empleado")
    getReporteAsistencia(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getReporteAsistencia(id_empleado, fechaInicio, fechaFin);
    }

    @Get("reporte-produccion")
    getReporteProduccion(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getReporteProduccion(id_empleado, fechaInicio, fechaFin);
    }

    @Get("horas-trabajadas")
    getReporteHorasTrabajadas(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getReporteHorasTrabajadas(id_empleado, fechaInicio, fechaFin);
    }

    @Get("unidades-producidas")
    getProduccionTotal(
        @Query('id_empleado', ParseIntPipe) id_empleado: number,
        @Query('fechaInicio') fechaInicio: string,
        @Query('fechaFin') fechaFin: string,
    ) {
        if (!fechaInicio || !fechaFin) {
            throw new BadRequestException('Las fechas de inicio y fin son requeridas');
        }
        return this.empleadosService.getProduccionTotal(id_empleado, fechaInicio, fechaFin);
    }

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Req() req: express.Request
    ) {
        const baseUrl = `${req.protocol}://${req.host}${req.baseUrl}/empleados`;
        return this.empleadosService.findAllEmpleado(Number(page), Number(limit), baseUrl);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.empleadosService.findOneEmpleado(id);
    }

    @Patch(':id_empleado')
    update(
        @Param('id_empleado', ParseIntPipe) id_empleado: number,
        @Body(new ValidationPipe()) data: UpdateEmpleado
    ) {
        return this.empleadosService.updateEmpleado(id_empleado, data);
    }

    @Delete(':id_empleado')
    remove(@Param('id_empleado', ParseIntPipe) id_empleado: number) {
        return this.empleadosService.removeEmpleado(id_empleado);
    }

    @Post("entrada/:id_empleado")
    createAsistenciaEntrada(@Param("id_empleado") id_empleado: string) {
        const id = parseInt(id_empleado, 10);
        if (isNaN(id)) {
            throw new BadRequestException('El ID del empleado debe ser un número válido');
        }
        return this.empleadosService.createAistenciaEntrada(id);
    }

    @Patch("salida/:id_empleado")
    updateAsistenciaSalida(@Param("id_empleado") id_empleado: string) {
        const id = parseInt(id_empleado, 10);
        if (isNaN(id)) {
            throw new BadRequestException('El ID del empleado debe ser un número válido');
        }
        return this.empleadosService.updateAistenciaSalida(id);
    }

    @Post("produccion/:id_empleado/:unidadesProducidas")
    createProduccion(
        @Param("id_empleado") id_empleado: string,
        @Param("unidadesProducidas") unidadesProducidas: string
    ) {
        const idEmpleado = parseInt(id_empleado, 10);
        const unidades = parseInt(unidadesProducidas, 10);
        
        if (isNaN(idEmpleado) || isNaN(unidades)) {
            throw new BadRequestException('Los parámetros deben ser números válidos');
        }
        
        if (unidades < 0) {
            throw new BadRequestException('Las unidades producidas no pueden ser negativas');
        }
        
        return this.empleadosService.createProduccion(idEmpleado, unidades);
    }
}