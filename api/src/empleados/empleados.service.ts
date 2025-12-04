import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { RegistroAsistencia } from './entities/registro-asistencia.entity';
import { RegistroProduccion } from './entities/registro-produccion.entity';
import { CreateEmpleado } from './dto/create-empleado.dto';
import { UpdateEmpleado } from './dto/update-empleado.dto';
import { CreateRegistroAsistencia } from './dto/create-registro-asistencia.dto';
import { CreateRegistroProduccion } from './dto/create-registro-produccion.dto';
import { Turno } from './enum/turno.enum';
import { StatusTurno } from './enum/status-turno.enum';

@Injectable()
export class EmpleadosService {
    constructor(
        @InjectRepository(Empleado, "conexion-postgres")
        private readonly repoEmpleado: Repository<Empleado>,
        @InjectRepository(RegistroAsistencia, "conexion-postgres")
        private readonly repoAsistencia: Repository<RegistroAsistencia>,
        @InjectRepository(RegistroProduccion, "conexion-postgres")
        private readonly repoProduccion: Repository<RegistroProduccion>,
    ){}

    private readonly horariosTurno = {
        [Turno.MATUTINO]:    { inicio: "06:00", fin: "14:00" },
        [Turno.VESPERTINO]:  { inicio: "14:00", fin: "22:00" },
        [Turno.NOCTURNO]:    { inicio: "22:00", fin: "06:00" },
        [Turno.MIXTO]:       { inicio: "12:00", fin: "00:00" },
    }

    private convertirFecha(fecha: string): Date {
        const [day, month, year] = fecha.split("/").map(Number);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            throw new BadRequestException('Formato de fecha inválido. Use DD/MM/YYYY');
        }
        
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    async createRegistroAsistencia(data: CreateRegistroAsistencia) {
        const empleado = await this.findOneEmpleado(data.id_empleado);

        // Forzar conversión robusta de puntual
        const parseBoolean = (v: any) => {
            if (typeof v === 'boolean') return v;
            if (typeof v === 'string') return v.toLowerCase() === 'true';
            return Boolean(v);
        };

        const register = this.repoAsistencia.create({
            empleado,
            fecha: new Date(data.fecha),
            horaEntrada: data.horaEntrada ? new Date(data.horaEntrada) : new Date(),
            horaSalida: data.horaSalida ? new Date(data.horaSalida) : null,
            puntual: parseBoolean(data.puntual),
            horasTrabajadas: Number(data.horasTrabajadas || 0),
            turno: data.turno || Turno.MATUTINO,
            estatus: data.estatus || StatusTurno.EN_TURNO
        });

        return await this.repoAsistencia.save(register);
    }

    async createRegistroProduccion(data: CreateRegistroProduccion) {
        const empleado = await this.findOneEmpleado(data.id_empleado);
        
        const register = this.repoProduccion.create({
            empleado,
            fecha: new Date(data.fecha),
            turno: data.turno || Turno.MATUTINO,
            unidadesProducidas: Number(data.unidadesProducidas || 0)
        });

        return await this.repoProduccion.save(register);
    }

    async createEmpleado(data: CreateEmpleado) {
        // Forzar conversión robusta de activo
        const parseBoolean = (v: any) => {
            if (typeof v === 'boolean') return v;
            if (typeof v === 'string') return v.toLowerCase() === 'true';
            return Boolean(v);
        };
        const register = this.repoEmpleado.create({
            ...data,
            activo: parseBoolean(data.activo ?? true)
        });
        return await this.repoEmpleado.save(register);
    }

    async findAllEmpleado(page: number = 1, limit: number = 10, baseUrl: string) {
        const [data, total] = await this.repoEmpleado
            .createQueryBuilder("e")
            .leftJoinAndSelect("e.produccion", "p")
            .leftJoinAndSelect("e.asistencia", "a")
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy("e.id_empleado", "ASC")
            .getManyAndCount();

        // Asegurar que los booleanos sean booleanos reales
        const dataCorregida = data.map(empleado => ({
            ...empleado,
            activo: Boolean(empleado.activo),
            salarioDiario: Number(empleado.salarioDiario),
            produccion: empleado.produccion?.map(p => ({
                ...p,
                unidadesProducidas: Number(p.unidadesProducidas)
            })) || [],
            asistencia: empleado.asistencia?.map(a => ({
                ...a,
                puntual: Boolean(a.puntual),
                horasTrabajadas: Number(a.horasTrabajadas)
            })) || []
        }));

        const totalPages = Math.ceil(total / limit);

        const next = (page < totalPages)
            ? `${baseUrl}?page=${Number(page) + 1}&limit=${limit}`
            : null;

        const prev = (page > 1)
            ? `${baseUrl}?page=${Number(page) - 1}&limit=${limit}`
            : null;

        return {
            total,
            totalPages,
            prev,
            next,
            page,
            limit,
            data: dataCorregida,
        };
    }

    async findOneEmpleado(id: number) {
        const empleado = await this.repoEmpleado
            .createQueryBuilder('empleado')
            .where('empleado.id_empleado = :id', { id })
            .leftJoinAndSelect('empleado.produccion', 'produccion')
            .leftJoinAndSelect('empleado.asistencia', 'asistencia')
            .getOne();
        
        if (!empleado) {
            throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
        }
        
        // Asegurar tipos correctos
        return {
            ...empleado,
            activo: Boolean(empleado.activo),
            salarioDiario: Number(empleado.salarioDiario),
            produccion: empleado.produccion?.map(p => ({
                ...p,
                unidadesProducidas: Number(p.unidadesProducidas)
            })) || [],
            asistencia: empleado.asistencia?.map(a => ({
                ...a,
                puntual: Boolean(a.puntual),
                horasTrabajadas: Number(a.horasTrabajadas)
            })) || []
        };
    }

    async updateEmpleado(id_empleado: number, data: UpdateEmpleado) {
        const empleado = await this.findOneEmpleado(id_empleado);
        
        if (!empleado) {
            throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
        }
        
        return await this.repoEmpleado.update(id_empleado, data);
    }

    async removeEmpleado(id_empleado: number) {
        const empleado = await this.findOneEmpleado(id_empleado);
        
        if (!empleado) {
            throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
        }
        
        return await this.repoEmpleado.delete(id_empleado);
    }

    async createAistenciaEntrada(id_empleado: number) {
        const empleado = await this.findOneEmpleado(id_empleado);
        
        const hoy = new Date();
        const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        const horaActual = hoy.getHours().toString().padStart(2, '0') + ':' + 
                          hoy.getMinutes().toString().padStart(2, '0');
        
        const horaInicio = this.horariosTurno[empleado.turno].inicio;
        const puntual = horaActual <= horaInicio;

        const registroExistente = await this.repoAsistencia.findOne({
            where: { 
                empleado: { id_empleado },
                fecha: fechaHoy,
                estatus: StatusTurno.EN_TURNO
            }
        });

        if (registroExistente) {
            throw new BadRequestException('Ya hay un turno activo hoy para este empleado');
        }

        const registro = this.repoAsistencia.create({
            empleado,
            fecha: fechaHoy,
            horaEntrada: hoy,
            turno: empleado.turno,
            puntual: Boolean(puntual),
            estatus: StatusTurno.EN_TURNO
        });

        return this.repoAsistencia.save(registro);
    }

    async updateAistenciaSalida(id_empleado: number) {
        const registro = await this.repoAsistencia.findOne({
            where: {
                empleado: { id_empleado },
                estatus: StatusTurno.EN_TURNO
            },
            relations: ["empleado"]
        });

        if (!registro) {
            throw new NotFoundException('No hay un turno activo para este empleado');
        }

        const ahora = new Date();
        registro.horaSalida = ahora;
        
        const horas = (ahora.getTime() - registro.horaEntrada.getTime()) / (1000 * 60 * 60);
        registro.horasTrabajadas = Number(parseFloat(horas.toFixed(2)));
        registro.estatus = StatusTurno.FINALIZADO;

        return await this.repoAsistencia.save(registro);
    }

    async createProduccion(id_empleado: number, unidadesProducidas: number) {
        const empleado = await this.findOneEmpleado(id_empleado);
        
        if (!empleado) {
            throw new NotFoundException("Empleado no encontrado");
        }

        const produccion = this.repoProduccion.create({
            empleado,
            fecha: new Date(),
            turno: empleado.turno,
            unidadesProducidas: Number(unidadesProducidas)
        });

        return await this.repoProduccion.save(produccion);
    }

    async getAsistencia(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);
        
        const result = await this.repoAsistencia
            .createQueryBuilder("a")
            .select("COUNT(a.id_reg_a)", "total_asistencias")
            .where("a.id_empleado = :id", { id: id_empleado })
            .andWhere("a.fecha BETWEEN :inicio AND :fin", { 
                inicio: inicio.toISOString().split('T')[0], 
                fin: fin.toISOString().split('T')[0] 
            })
            .getRawOne();
            
        return { total_asistencias: result?.total_asistencias || "0" };
    }

    async getNomina(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);
        const empleado = await this.findOneEmpleado(id_empleado);
        
        if (!empleado) {
            throw new NotFoundException("Empleado no encontrado");
        }

        const asistencias = await this.repoAsistencia.find({
            where: { 
                empleado: { id_empleado },
                fecha: Between(inicio, fin) 
            }
        });
        
        const diasTrabajados = asistencias.length;
        const total = diasTrabajados * Number(empleado.salarioDiario);
        
        return { 
            diasTrabajados, 
            asistencias: asistencias.map(a => ({
                ...a,
                puntual: Boolean(a.puntual),
                horasTrabajadas: Number(a.horasTrabajadas)
            })), 
            total: Number(parseFloat(total.toFixed(2)))
        };
    }

    async getDiasTrabajados(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);
        
        const results = await this.repoAsistencia
            .createQueryBuilder("a")
            .select([
                "a.id_reg_a as a_id_reg_a",
                "a.fecha as a_fecha",
                "a.horaEntrada as a_horaEntrada",
                "a.horaSalida as a_horaSalida"
            ])
            .where("a.id_empleado = :id", { id: id_empleado })
            .andWhere("a.fecha BETWEEN :inicio AND :fin", { 
                inicio: inicio.toISOString().split('T')[0], 
                fin: fin.toISOString().split('T')[0] 
            })
            .orderBy("a.id_reg_a", "DESC")
            .getRawMany();
            
        return results.map(item => ({
            a_id_reg_a: Number(item.a_id_reg_a),
            a_fecha: new Date(item.a_fecha).toISOString().split('T')[0],
            a_horaEntrada: item.a_horaEntrada ? new Date(item.a_horaEntrada).toISOString() : null,
            a_horaSalida: item.a_horaSalida ? new Date(item.a_horaSalida).toISOString() : null
        }));
    }

    async getReporteAsistencia(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);

        const data = await this.repoAsistencia
            .createQueryBuilder("a")
            .leftJoin("a.empleado", "e")
            .select([
                "a.id_reg_a as a_id_reg_a",
                "a.fecha as a_fecha",
                "a.horaEntrada as a_horaEntrada",
                "a.horaSalida as a_horaSalida",
                "a.turno as a_turno",
                "a.horasTrabajadas as a_horasTrabajadas",
                "e.id_empleado as e_id_empleado",
                "e.nombre as e_nombre",
                "e.apellido_p as e_apellido_p",
                "e.apellido_m as e_apellido_m",
            ])
            .where("a.id_empleado = :id", { id: id_empleado })
            .andWhere("a.fecha BETWEEN :inicio AND :fin", { 
                inicio: inicio.toISOString().split('T')[0], 
                fin: fin.toISOString().split('T')[0] 
            })
            .orderBy("a.fecha", "DESC")
            .getRawMany();

        // Calcular total de horas trabajadas
        const totalHoras = data.reduce((acc, item) => acc + (item.a_horasTrabajadas ? Number(item.a_horasTrabajadas) : 0), 0);

        return {
            total: data.length,
            totalHorasTrabajadas: Number(totalHoras.toFixed(2)),
            data: data.map(item => ({
                a_id_reg_a: Number(item.a_id_reg_a),
                a_fecha: new Date(item.a_fecha).toISOString().split('T')[0],
                a_horaEntrada: item.a_horaEntrada ? new Date(item.a_horaEntrada).toISOString() : '--:--',
                a_horaSalida: item.a_horaSalida ? new Date(item.a_horaSalida).toISOString() : '--:--',
                a_turno: item.a_turno,
                a_horasTrabajadas: item.a_horasTrabajadas ? Number(item.a_horasTrabajadas) : 0,
                e_id_empleado: Number(item.e_id_empleado),
                e_nombre: item.e_nombre,
                e_apellido_p: item.e_apellido_p,
                e_apellido_m: item.e_apellido_m
            }))
        };
    }

    async getReporteProduccion(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);

        // Agrupar por día y sumar unidades producidas
        const data = await this.repoProduccion
            .createQueryBuilder("p")
            .leftJoin("p.empleado", "e")
            .select([
                "p.fecha as p_fecha",
                "p.turno as p_turno",
                "SUM(p.unidadesProducidas) as p_unidadesProducidas",
                "e.id_empleado as e_id_empleado",
                "e.nombre as e_nombre",
                "e.apellido_p as e_apellido_p",
                "e.apellido_m as e_apellido_m"
            ])
            .where("p.id_empleado = :id", { id: id_empleado })
            .andWhere("p.fecha BETWEEN :inicio AND :fin", { 
                inicio: inicio.toISOString().split('T')[0], 
                fin: fin.toISOString().split('T')[0] 
            })
            .groupBy("p.fecha")
            .addGroupBy("p.turno")
            .addGroupBy("e.id_empleado")
            .addGroupBy("e.nombre")
            .addGroupBy("e.apellido_p")
            .addGroupBy("e.apellido_m")
            .orderBy("p.fecha", "DESC")
            .getRawMany();

        return data.map(item => ({
            p_fecha: new Date(item.p_fecha).toISOString().split('T')[0],
            p_turno: item.p_turno,
            p_unidadesProducidas: item.p_unidadesProducidas !== null && item.p_unidadesProducidas !== undefined ? Number(item.p_unidadesProducidas) : 0,
            e_id_empleado: Number(item.e_id_empleado),
            e_nombre: item.e_nombre,
            e_apellido_p: item.e_apellido_p,
            e_apellido_m: item.e_apellido_m
        }));
    }

    async getReporteHorasTrabajadas(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);
        
        const data = await this.repoAsistencia
            .createQueryBuilder("a")
            .leftJoin("a.empleado", "e")
            .select([
                "a.id_reg_a as a_id_reg_a",
                "a.fecha as a_fecha",
                "a.turno as a_turno",
                "a.horasTrabajadas as a_horasTrabajadas",
                "e.nombre as e_nombre",
                "e.apellido_p as e_apellido_p",
                "e.apellido_m as e_apellido_m"
            ])
            .where("a.id_empleado = :id", { id: id_empleado })
            .andWhere("a.fecha BETWEEN :inicio AND :fin", { 
                inicio: inicio.toISOString().split('T')[0], 
                fin: fin.toISOString().split('T')[0] 
            })
            .orderBy("a.fecha", "DESC")
            .getRawMany();
            
        return data.map(item => ({
            a_id_reg_a: Number(item.a_id_reg_a),
            a_fecha: new Date(item.a_fecha).toISOString().split('T')[0],
            a_horasTrabajadas: item.a_horasTrabajadas !== null && item.a_horasTrabajadas !== undefined ? Number(parseFloat(item.a_horasTrabajadas)) : 0,
            a_turno: item.a_turno,
            e_nombre: item.e_nombre,
            e_apellido_p: item.e_apellido_p,
            e_apellido_m: item.e_apellido_m
        }));
    }

    async getProduccionTotal(id_empleado: number, fechaInicio: string, fechaFin: string) {
        const inicio = this.convertirFecha(fechaInicio);
        const fin = this.convertirFecha(fechaFin);
        
        const empleado = await this.findOneEmpleado(id_empleado);
        
        const result = await this.repoProduccion
            .createQueryBuilder("p")
            .innerJoin("p.empleado", "e")
            .select("SUM(p.unidadesProducidas)", "total_producido")
            .where("p.id_empleado = :id", { id: id_empleado })
            .andWhere("p.fecha BETWEEN :inicio AND :fin", { 
                inicio: inicio.toISOString().split('T')[0], 
                fin: fin.toISOString().split('T')[0] 
            })
            .getRawOne();
            
        return { 
            empleado: {
                id_empleado: empleado.id_empleado,
                nombre: empleado.nombre,
                apellido_p: empleado.apellido_p,
                apellido_m: empleado.apellido_m,
                area: empleado.area,
                turno: empleado.turno,
                activo: Boolean(empleado.activo),
                salarioDiario: Number(empleado.salarioDiario)
            }, 
            total: [{ total_producido: String(result?.total_producido !== null && result?.total_producido !== undefined ? result.total_producido : "0") }] 
        };
    }
}