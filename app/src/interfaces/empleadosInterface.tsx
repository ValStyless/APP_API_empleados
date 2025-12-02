export interface Empleados {
    total:      number;
    totalPages: number;
    prev:       null;
    next:       string;
    page:       number;
    limit:      number;
    data:       Datum[];
}

export interface Datum {
    id_empleado:   number;
    produccion:    Produccion[];
    asistencia:    Asistencia[];
    nombre:        string;
    apellido_p:    string;
    apellido_m:    string;
    area:          Area;
    turno:         Turno;
    salarioDiario: string;
    activo:        boolean;
}

export enum Area {
    Inventario = "INVENTARIO",
    Oficina = "OFICINA",
    Produccion = "PRODUCCION",
}

export interface Asistencia {
    id_reg_a:        number;
    fecha:           Date;
    horaEntrada:     Date;
    horaSalida:      Date;
    puntual:         boolean;
    horasTrabajadas: number;
    turno:           Turno;
    estatus:         Estatus;
}

export enum Estatus {
    EnTurno = "EN_TURNO",
}

export enum Turno {
    Matutino = "MATUTINO",
    Mixto = "MIXTO",
    Nocturno = "NOCTURNO",
    Vespertino = "VESPERTINO",
}

export interface Produccion {
    id_reg_p:           number;
    fecha:              Date;
    turno:              Turno;
    unidadesProducidas: number;
}

export interface CreateEmpleadoDto {
    id_empleado:   number;
    produccion:    Produccion[];
    asistencia:    Asistencia[];
    nombre:        string;
    apellido_p:    string;
    apellido_m:    string;
    apellido?:     string;
    area:          Area;
    turno:         Turno;
    salarioDiario: string;
    activo:        boolean;
}

export interface ReporteAsistencia {
    total: number;
    data: AsistenciaItem[];
}

export interface AsistenciaItem {
    a_id_reg_a: number;
    a_fecha: string;
    a_horaEntrada: string;
    a_horaSalida: string;
    a_turno: string;
    e_id_empleado: number;
    e_nombre: string;
    e_apellido_p: string;
    e_apellido_m: string;
}

export interface AsistenciaEmpleado {
    total_asistencias: string;
}

export interface Nomina {
    diasTrabajados: number;
    asistencias: Asistencia[];
    total: number;
}

export interface DiasTrabajados {
    a_id_reg_a: number;
    a_fecha: string;
    a_horaEntrada: string;
    a_horaSalida: string;
}

export interface ReporteProduccion {
    p_id_reg_p: number;
    p_fecha: string;
    p_turno: string;
    p_unidadesProducidas: number;
    e_id_empleado: number;
    e_nombre: string;
    e_apellido_p: string;
    e_apellido_m: string;
}

export interface HorasTrabajadas {
    a_id_reg_a: number;
    a_fecha: string;
    a_horasTrabajadas: number;
    a_turno: string;
    e_nombre: string;
    e_apellido_p: string;
    e_apellido_m: string;
}

export interface UnidadesProducidas {
    empleado: any;
    total: UnidadProducida[];
}

export interface UnidadProducida {
    total_producido: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toEmpleados(json: string): Empleados {
        return cast(JSON.parse(json), r("Empleados"));
    }

    public static empleadosToJson(value: Empleados): string {
        return JSON.stringify(uncast(value, r("Empleados")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Empleados": o([
        { json: "total", js: "total", typ: 0 },
        { json: "totalPages", js: "totalPages", typ: 0 },
        { json: "prev", js: "prev", typ: null },
        { json: "next", js: "next", typ: "" },
        { json: "page", js: "page", typ: 0 },
        { json: "limit", js: "limit", typ: 0 },
        { json: "data", js: "data", typ: a(r("Datum")) },
    ], false),
    "Datum": o([
        { json: "id_empleado", js: "id_empleado", typ: 0 },
        { json: "produccion", js: "produccion", typ: a(r("Produccion")) },
        { json: "asistencia", js: "asistencia", typ: a(r("Asistencia")) },
        { json: "nombre", js: "nombre", typ: "" },
        { json: "apellido_p", js: "apellido_p", typ: "" },
        { json: "apellido_m", js: "apellido_m", typ: "" },
        { json: "area", js: "area", typ: r("Area") },
        { json: "turno", js: "turno", typ: r("Turno") },
        { json: "salarioDiario", js: "salarioDiario", typ: "" },
        { json: "activo", js: "activo", typ: true },
    ], false),
    "Asistencia": o([
        { json: "id_reg_a", js: "id_reg_a", typ: 0 },
        { json: "fecha", js: "fecha", typ: Date },
        { json: "horaEntrada", js: "horaEntrada", typ: Date },
        { json: "horaSalida", js: "horaSalida", typ: Date },
        { json: "puntual", js: "puntual", typ: true },
        { json: "horasTrabajadas", js: "horasTrabajadas", typ: 0 },
        { json: "turno", js: "turno", typ: r("Turno") },
        { json: "estatus", js: "estatus", typ: r("Estatus") },
    ], false),
    "Produccion": o([
        { json: "id_reg_p", js: "id_reg_p", typ: 0 },
        { json: "fecha", js: "fecha", typ: Date },
        { json: "turno", js: "turno", typ: r("Turno") },
        { json: "unidadesProducidas", js: "unidadesProducidas", typ: 0 },
    ], false),
    "Area": [
        "INVENTARIO",
        "OFICINA",
        "PRODUCCION",
    ],
    "Estatus": [
        "EN_TURNO",
    ],
    "Turno": [
        "MATUTINO",
        "MIXTO",
        "NOCTURNO",
        "VESPERTINO",
    ],
};
