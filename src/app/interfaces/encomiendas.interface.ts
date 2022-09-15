export interface encomienda {
    delete?: boolean
    category?: string
    message?: string
    timeOut?: string | number
    products?: []
    client?: number
    driver?: number
    state?: string
    route?: {
        start: any
        end: any
        distance: string
        price: number
    }
    payment?: {
        recibed: number
        status: boolean
        type: string
        value: number
    }
    receiver:{
        name:string
        phone:string
    }
}