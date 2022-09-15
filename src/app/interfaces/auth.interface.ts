export interface SingUpI{
    dni:number
    name:string
    lastname:string
    phone:string
    mail:string
    password:string
}
export interface SingInRequestI{
    email:string,
    pass:string
}

export interface SigInResponseI{
    jwt:string
    user:any
}
export interface SingUpResponseI{
    dni:number
    name:string
    lastname:string
    phone:string
    mail:string
    password:string
}
